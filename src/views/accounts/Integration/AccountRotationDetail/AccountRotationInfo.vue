<template>
  <TwoCol :gutter="20" :left="16" :right="8">
    <el-alert
      v-if="object.precheck && object.precheck.status !== 'passed'"
      :title="precheckMessage"
      :description="object.precheck.code === 'changed' ? object.precheck.detail : ''"
      :type="object.precheck.status === 'checking' ? 'info' : 'error'"
      :closable="false"
      show-icon
      class="detail-block"
    />
    <DetailCard :items="detailItems" :title="$t('BasicInfo')" class="detail-block" />
    <IBox v-if="object.blockers?.length" :title="$t('WaitingForApplications')" class="detail-block">
      <DataTable :config="blockerTableConfig" />
    </IBox>

    <template #right>
      <QuickActions :actions="quickActions" :title="$t('CurrentAction')" class="detail-block" />

      <IBox
        v-if="object.type === 'rotation'"
        :title="$t('RotationProgress')"
        class="detail-block rotation-steps"
      >
        <el-steps :active="rotationStep" direction="vertical" finish-status="success">
          <el-step
            v-for="step in rotationSteps"
            :key="step.title"
            :description="step.description"
            :title="step.title"
          />
        </el-steps>
      </IBox>
    </template>
  </TwoCol>
</template>

<script lang="jsx">
import { IBox, QuickActions } from '@/components'
import { ActionsFormatter } from '@/components/Table/TableFormatters'
import DetailCard from '@/components/Cards/DetailCard/index.vue'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import DataTable from '@/components/Table/DataTable/index.vue'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import { credentialStatusLabel } from '../components/credentialStatus.js'
import { openTaskPage } from '@/utils/jms'
import {
  advanceApplicationCredentialRotation,
  cancelApplicationCredentialRotation,
  getApplicationCredential,
  executeCredentialChange,
  retryCredentialChange,
  setClientInstanceActive
} from '@/api/applicationCredential'

const accountName = (account) => account?.username || account?.name || '-'

export default {
  name: 'ApplicationCredentialInfo',
  components: { DetailCard, IBox, QuickActions, TwoCol, DataTable },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  emits: ['edit', 'updated'],
  data() {
    return { actionLoading: false, precheckTimer: null, disposed: false }
  },
  watch: {
    'object.id'() {
      this.schedulePrecheckRefresh()
    },
    'object.precheck.status': {
      immediate: true,
      handler() {
        this.schedulePrecheckRefresh()
      }
    }
  },
  beforeUnmount() {
    this.disposed = true
    clearTimeout(this.precheckTimer)
  },
  computed: {
    precheckMessage() {
      const precheck = this.object.precheck
      if (precheck?.status === 'checking') return this.$t('PamPrecheckRunning')
      const keys = {
        timeout: 'PamPrecheckTimeout',
        changed: 'PamPrecheckChanged',
        dispatch_failed: 'PamPrecheckDispatchFailed',
        failed: 'PamPrecheckFailed'
      }
      return this.$t(keys[precheck?.code] || 'PamPrecheckFailed')
    },
    rotationStep() {
      if (this.object.status === 'idle') {
        return this.object.date_last_rotated ? this.rotationSteps.length : 0
      }
      const dual = {
        waiting_backup: 0,
        ready_for_change: 1,
        changing_secret: 2,
        change_failed: 2,
        recovery_required: 2,
        waiting_primary: 3
      }
      const single = { ready_for_change: 0, changing_secret: 0, waiting_primary: 1 }
      return (this.object.rotation_mode === 'dual' ? dual : single)[this.object.status] || 0
    },
    blockerTableConfig() {
      return {
        url: '',
        totalData: this.object.blockers,
        hasPagination: false,
        hasSelection: false,
        columns: [
          { prop: 'application.name', label: this.$t('Applications'), minWidth: 130 },
          { prop: 'client.instance_id', label: this.$t('InstanceID'), minWidth: 150 },
          {
            prop: 'reason',
            label: this.$t('Status'),
            minWidth: 130,
            formatter: (row) =>
              row.reason === 'offline' ? this.$t('Offline') : this.$t('WaitingForClientReport')
          },
          {
            prop: 'actions',
            label: this.$t('Actions'),
            width: 100,
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: false,
              hasDelete: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'disable',
                  title: this.$t('Disable'),
                  type: 'danger',
                  can: () =>
                    this.$hasPerm('accounts.change_credentialclientinstance') &&
                    !this.actionLoading,
                  callback: ({ row }) => this.disableClient(row)
                }
              ]
            }
          }
        ]
      }
    },
    typeLabel() {
      return this.object.type === 'fixed' ? this.$t('FixedAccount') : this.$t('AccountRotation')
    },
    rotationModeLabel() {
      if (this.object.type === 'fixed') return '-'
      return this.object.rotation_mode === 'dual'
        ? this.$t('DualAccountRotation')
        : this.$t('SingleAccountRotation')
    },
    detailItems() {
      const asset = this.object.asset || {}
      const items = [
        { key: this.$t('Name'), value: this.object.name },
        { key: this.$t('CredentialKey'), value: this.object.key },
        { key: this.$t('CredentialType'), value: this.typeLabel },
        {
          key: this.$t('Status'),
          value: credentialStatusLabel(this.object, this.$t),
          formatter: (_item, value) => (
            <el-tag
              type={
                !this.object.is_active
                  ? 'info'
                  : this.object.status === 'idle'
                    ? 'success'
                    : 'warning'
              }
            >
              {value}
            </el-tag>
          )
        },
        {
          key: this.$t('Asset'),
          value: asset.name ? `${asset.name} (${asset.address})` : '-'
        },
        { key: this.$t('AssetType'), value: asset.platform?.name || '-' }
      ]
      if (this.object.rotation_mode === 'dual') {
        items.push(
          { key: this.$t('RotationMode'), value: this.rotationModeLabel },
          { key: this.$t('PrimaryAccount'), value: accountName(this.object.primary_account) },
          { key: this.$t('BackupAccount'), value: accountName(this.object.backup_account) },
          { key: this.$t('ActiveAccount'), value: accountName(this.object.published_account) }
        )
      } else {
        if (this.object.type === 'rotation') {
          items.push({ key: this.$t('RotationMode'), value: this.rotationModeLabel })
        }
        items.push({ key: this.$t('Account'), value: accountName(this.object.primary_account) })
      }
      items.push(
        { key: this.$t('LastFetched'), value: this.formatDate(this.object.last_fetched) },
        { key: this.$t('LastRotation'), value: this.formatDate(this.object.date_last_rotated) },
        { key: this.$t('Comment'), value: this.object.comment || '-' }
      )
      if (this.object.change_execution) {
        items.push({
          key: this.$t('ChangeSecretExecution'),
          value: this.object.change_execution.id
        })
      }
      if (this.object.rotation) {
        const rotation = this.object.rotation
        const outcomes = {
          running: 'Running',
          success: 'Success',
          unchanged: 'PamChangeFailed',
          unverified: 'PamRecoveryRequired'
        }
        items.push(
          {
            key: this.$t('PamExecutionStatus'),
            value: this.$t(outcomes[rotation.outcome] || 'ReadyForSecretChange')
          },
          { key: this.$t('DateStart'), value: this.formatDate(rotation.date_start) },
          { key: this.$t('Error'), value: rotation.error || '-' }
        )
      }
      return items
    },
    rotationSteps() {
      if (this.object.rotation_mode === 'dual') {
        return [
          {
            title: this.$t('SwitchingToBackup'),
            description: this.$t('WaitingForClientReport')
          },
          {
            title: this.$t('ConfirmApplicationsOnBackup'),
            description: this.$t('SecretChangeGuard')
          },
          {
            title: this.$t('ChangeAndVerifySecret'),
            description: this.$t('ChangePrimaryAccountSecretHelp')
          },
          {
            title: this.$t('SwitchBackToPrimary'),
            description: this.$t('WaitingForClientReport')
          },
          {
            title: this.$t('RotationCompleted'),
            description: this.$t('AllClientsConfirmed')
          }
        ]
      }
      return [
        {
          title: this.$t('ChangeAndVerifySecret'),
          description: this.$t('ChangeSingleAccountSecretHelp')
        },
        {
          title: this.$t('WaitingForApplications'),
          description: this.$t('WaitingForClientReport')
        },
        {
          title: this.$t('RotationCompleted'),
          description: this.$t('AllClientsConfirmed')
        }
      ]
    },
    quickActions() {
      return [
        {
          title: this.$t('ChangeSecret'),
          has:
            !!this.object.rotation?.automation_id &&
            ['ready_for_change', 'change_failed'].includes(this.object.status) &&
            this.$hasPerm('accounts.change_changesecretautomation'),
          attrs: { label: this.$t('Edit'), disabled: this.actionLoading },
          callbacks: {
            click: () =>
              this.$router.push({
                name: 'AccountChangeSecretUpdate',
                params: { id: this.object.rotation.automation_id }
              })
          }
        },
        {
          title: this.$t('Configuration'),
          has: this.$hasPerm('accounts.change_applicationcredential'),
          attrs: { label: this.$t('Edit'), disabled: this.object.status !== 'idle' },
          callbacks: { click: () => this.$emit('edit', this.object) }
        },
        {
          title: this.$t('AccountRotation'),
          has:
            this.object.type === 'rotation' &&
            this.$hasPerm('accounts.change_applicationcredential'),
          attrs: {
            type: 'primary',
            label:
              this.object.status === 'idle'
                ? this.$t(
                    this.object.precheck?.status === 'checking'
                      ? 'PamPrecheckRunning'
                      : 'StartRotation'
                  )
                : this.object.status === 'ready_for_change'
                  ? this.$t(this.object.rotation?.automation_id ? 'Execute' : 'ChangeSecret')
                  : ['changing_secret', 'change_failed', 'recovery_required'].includes(
                        this.object.status
                      )
                    ? this.$t('CheckSecretChangeResult')
                    : this.$t('ContinueRotation'),
            loading: this.actionLoading,
            disabled:
              !this.object.is_active ||
              this.object.precheck?.status === 'checking' ||
              (this.object.status === 'idle' &&
                this.object.rotation_mode === 'dual' &&
                !this.$hasPerm('accounts.verify_account')) ||
              (this.object.status === 'ready_for_change' &&
                !this.$hasPerm(
                  this.object.rotation?.automation_id
                    ? 'accounts.add_changesecretexecution'
                    : 'accounts.add_changesecretautomation'
                ))
          },
          callbacks: { click: this.advanceRotation }
        },
        {
          title: this.$t('ExecutionLog'),
          has:
            this.object.type === 'rotation' &&
            !!this.object.rotation?.execution_id &&
            this.$hasPerm('accounts.view_changesecretexecution'),
          attrs: {
            label: this.$t('View')
          },
          callbacks: { click: () => openTaskPage(this.object.rotation.execution_id) }
        },
        {
          title: this.$t('PamChangeSecretResult'),
          has:
            this.object.type === 'rotation' &&
            !!this.object.rotation?.execution_id &&
            this.$hasPerm('accounts.view_changesecretrecord'),
          attrs: { label: this.$t('View') },
          callbacks: {
            click: () =>
              this.$router.push({
                name: 'AccountChangeSecretList',
                query: {
                  tab: 'ChangeSecretRecord',
                  execution_id: this.object.rotation.execution_id
                }
              })
          }
        },
        {
          title: this.$t('ChangeSecret'),
          has:
            this.object.rotation?.execution_status === 'pending' &&
            this.$hasPerm('accounts.add_changesecretexecution') &&
            this.$hasPerm('accounts.change_applicationcredential'),
          attrs: { label: this.$t('PamRedispatch'), disabled: this.actionLoading },
          callbacks: { click: this.executeSavedTask }
        },
        {
          title: this.$t('Retry'),
          has:
            this.object.status === 'change_failed' &&
            this.$hasPerm('accounts.add_changesecretexecution') &&
            this.$hasPerm('accounts.change_applicationcredential'),
          attrs: { label: this.$t('Retry'), disabled: this.actionLoading },
          callbacks: { click: this.retryChange }
        },
        {
          title: this.$t('Cancel'),
          has:
            this.object.type === 'rotation' &&
            ['waiting_backup', 'ready_for_change', 'change_failed'].includes(this.object.status) &&
            this.$hasPerm('accounts.change_applicationcredential'),
          attrs: { label: this.$t('CancelRotation'), disabled: this.actionLoading },
          callbacks: { click: this.cancelRotation }
        },
        {
          title: this.$t('Status'),
          attrs: { label: this.$t('Refresh'), disabled: this.actionLoading },
          callbacks: { click: this.refresh }
        },
        {
          title: this.$t('PamPrecheck'),
          has: !!this.object.precheck?.execution_id && this.$hasPerm('accounts.verify_account'),
          attrs: { label: this.$t('View') },
          callbacks: { click: () => openTaskPage(this.object.precheck.execution_id) }
        }
      ]
    }
  },
  methods: {
    schedulePrecheckRefresh() {
      clearTimeout(this.precheckTimer)
      if (this.disposed || this.object.precheck?.status !== 'checking') return
      this.precheckTimer = setTimeout(async () => {
        try {
          const id = this.object.id
          const updated = await getApplicationCredential(id)
          if (this.disposed || this.object.id !== id) return
          this.$emit('updated', updated)
          await this.$nextTick()
          this.schedulePrecheckRefresh()
        } catch (_) {
          // The shared request handler displays the error; manual refresh remains available.
        }
      }, 3000)
    },
    formatDate(value) {
      return value ? toSafeLocalDateStr(value) : '-'
    },
    async advanceRotation() {
      const createTask = this.object.status === 'ready_for_change'
      if (createTask) {
        if (this.object.rotation?.automation_id) return this.executeSavedTask()
        return this.openChangeSecretForm()
      }
      this.actionLoading = true
      try {
        const updated = await advanceApplicationCredentialRotation(this.object)
        this.$emit('updated', updated)
        if (updated.status !== this.object.status) {
          this.$message.success(
            updated.status === 'idle' ? this.$t('RotationCompleted') : this.$t('StepCompleted')
          )
        }
      } catch (error) {
        if (error.response?.data?.blockers) await this.refresh()
      } finally {
        this.actionLoading = false
      }
    },
    openChangeSecretForm() {
      if (!this.$hasPerm('accounts.add_changesecretautomation')) return
      return this.$router.push({
        name: 'AccountChangeSecretCreate',
        query: {
          application_credential: this.object.id,
          credential_rotation: this.object.rotation?.id
        }
      })
    },
    async executeSavedTask() {
      this.actionLoading = true
      try {
        await executeCredentialChange(this.object.rotation.automation_id)
        await this.refresh()
      } finally {
        this.actionLoading = false
      }
    },
    async retryChange() {
      const { value } = await this.$prompt(this.$t('PamChangeReason'), this.$t('Retry'), {
        inputValidator: (value) => !!value?.trim(),
        inputErrorMessage: this.$t('PamChangeReason')
      })
      this.actionLoading = true
      try {
        await retryCredentialChange(this.object.id, this.object.rotation.execution_id, value.trim())
        await this.refresh()
      } finally {
        this.actionLoading = false
      }
    },
    async cancelRotation() {
      let reason = ''
      if (this.object.status === 'change_failed') {
        const { value } = await this.$prompt(
          this.$t('PamChangeReason'),
          this.$t('CancelRotation'),
          {
            inputValidator: (value) => !!value?.trim(),
            inputErrorMessage: this.$t('PamChangeReason')
          }
        )
        reason = value.trim()
      }
      this.actionLoading = true
      try {
        const updated = await cancelApplicationCredentialRotation(this.object.id, reason)
        this.$emit('updated', updated)
        this.$message.success(this.$t('UpdateSuccessMsg'))
      } finally {
        this.actionLoading = false
      }
    },
    async refresh() {
      this.$emit('updated', await getApplicationCredential(this.object.id))
    },
    async disableClient(row) {
      await this.$confirm(this.$t('DisableCredentialClientConfirm'), this.$t('Warning'), {
        type: 'warning'
      })
      await setClientInstanceActive(row.client.id, false)
      await this.refresh()
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-block {
  margin-bottom: 15px;
}

.rotation-steps :deep(.el-step__main) {
  min-width: 0;
  padding-bottom: 18px;
}

.rotation-steps :deep(.el-step__title) {
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 600;
  line-height: 24px;
}

.rotation-steps :deep(.el-step__description) {
  padding-right: 0;
  color: var(--color-help-text);
  line-height: 20px;
}
</style>
