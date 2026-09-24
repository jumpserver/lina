<template>
  <section class="credential-info" :aria-label="$t('BasicInfo')">
    <el-alert
      v-if="object.precheck && object.precheck.status !== 'passed'"
      :title="precheckMessage"
      :description="object.precheck.code === 'changed' ? object.precheck.detail : ''"
      :type="object.precheck.status === 'checking' ? 'info' : 'error'"
      :closable="false"
      show-icon
    />
    <TwoCol :gutter="20" :left="16" :right="8">
      <DetailCard :items="detailItems" :title="$t('BasicInfo')" />
      <template #right>
        <QuickActions :actions="quickActions" :title="$t('CurrentAction')" />
      </template>
    </TwoCol>

    <IBox
      v-if="object.mode === 'alternating_rotation'"
      :title="$t('RotationProgress')"
      class="rotation-steps"
    >
      <el-steps :active="rotationStep" direction="horizontal" finish-status="success">
        <el-step
          v-for="step in rotationSteps"
          :key="step.title"
          :description="step.description"
          :title="step.title"
        />
      </el-steps>
    </IBox>
  </section>
</template>

<script lang="jsx">
import { IBox, QuickActions } from '@/components'
import DetailCard from '@/components/Cards/DetailCard/index.vue'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import { credentialStatusLabel } from '../components/credentialStatus.js'
import { openTaskPage } from '@/utils/jms'
import {
  advanceApplicationCredentialRotation,
  cancelApplicationCredentialRotation,
  getApplicationCredential,
  executeCredentialChange,
  getCredentialRotationStatus,
  retryCredentialChange
} from '@/api/applicationCredential'

const accountName = (account) => account?.username || account?.name || '-'

export default {
  name: 'ApplicationCredentialInfo',
  components: { DetailCard, IBox, QuickActions, TwoCol },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  emits: ['edit', 'updated'],
  data() {
    return {
      actionLoading: false,
      disposed: false,
      precheckTimer: null,
      rotationStatus: null,
      rotationStatusTimer: null
    }
  },
  watch: {
    'object.id': {
      immediate: true,
      handler() {
        this.schedulePrecheckRefresh()
        this.loadRotationStatus()
      }
    },
    'object.precheck.status': {
      immediate: true,
      handler() {
        this.schedulePrecheckRefresh()
      }
    },
    'object.status': {
      immediate: true,
      handler() {
        this.scheduleRotationStatusRefresh()
      }
    }
  },
  beforeUnmount() {
    this.disposed = true
    clearTimeout(this.precheckTimer)
    clearTimeout(this.rotationStatusTimer)
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
      const steps = {
        waiting_switch: 0,
        ready_for_change: 1,
        changing_secret: 2,
        change_failed: 2,
        recovery_required: 2,
        waiting_revert: 3
      }
      return steps[this.object.status] || 0
    },
    modeLabel() {
      return this.$t(
        this.object.mode === 'alternating_rotation'
          ? 'AlternatingAccountRotation'
          : 'CredentialUpdateSubscription'
      )
    },
    detailItems() {
      const items = [
        { key: this.$t('Name'), value: this.object.name },
        { key: this.$t('CredentialKey'), value: this.object.key },
        { key: this.$t('CredentialPolicyMode'), value: this.modeLabel },
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
        }
      ]
      if (this.object.mode === 'alternating_rotation') {
        const asset = this.object.asset || {}
        const nextAccount =
          this.object.active_account?.id === this.object.account?.id
            ? this.object.alternate_account
            : this.object.account
        items.push(
          {
            key: this.$t('Asset'),
            value: asset.name ? `${asset.name} (${asset.address})` : '-'
          },
          { key: this.$t('AssetType'), value: asset.platform?.name || '-' },
          { key: this.$t('CurrentAccount'), value: accountName(this.object.active_account) },
          { key: this.$t('NextAccount'), value: accountName(nextAccount) }
        )
      } else {
        items.push({
          key: this.$t('SubscriptionScope'),
          value: this.object.applications?.map((application) => application.name).join(', ') || '-'
        })
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
      return [
        {
          title: this.$t('SwitchToAlternateAccount'),
          description: this.$t('WaitingForClientReport')
        },
        {
          title: this.$t('ConfirmApplicationsSwitched'),
          description: this.$t('SecretChangeGuard')
        },
        {
          title: this.$t('ChangeAndVerifySecret'),
          description: this.$t('ChangeInactiveAccountSecretHelp')
        },
        {
          title: this.$t('RotationCompleted'),
          description: this.$t('AllClientsConfirmed')
        }
      ]
    },
    rotationActionLabel() {
      let label
      if (this.object.status === 'idle') {
        label = this.$t(
          this.object.precheck?.status === 'checking' ? 'PamPrecheckRunning' : 'StartRotation'
        )
      } else if (this.object.status === 'ready_for_change') {
        label = this.$t(this.object.rotation?.automation_id ? 'Execute' : 'ChangeSecret')
      } else if (
        ['changing_secret', 'change_failed', 'recovery_required'].includes(this.object.status)
      ) {
        label = this.$t('CheckSecretChangeResult')
      } else {
        label = this.$t('ContinueRotation')
      }
      const blockers = this.rotationStatus?.summary?.blocking || 0
      return blockers ? `${label} (${blockers})` : label
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
            this.object.mode === 'alternating_rotation' &&
            this.$hasPerm('accounts.change_applicationcredential'),
          attrs: {
            type: 'primary',
            label: this.rotationActionLabel,
            loading: this.actionLoading,
            disabled:
              !this.object.is_active ||
              this.object.precheck?.status === 'checking' ||
              (this.object.status === 'idle' && !this.$hasPerm('accounts.verify_account')) ||
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
            this.object.mode === 'alternating_rotation' &&
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
            this.object.mode === 'alternating_rotation' &&
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
            this.object.mode === 'alternating_rotation' &&
            ['waiting_switch', 'ready_for_change', 'change_failed'].includes(this.object.status) &&
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
    async loadRotationStatus() {
      clearTimeout(this.rotationStatusTimer)
      if (this.object.mode !== 'alternating_rotation' || !this.object.id) {
        this.rotationStatus = null
        return
      }
      try {
        this.rotationStatus = await getCredentialRotationStatus(this.object.id)
      } finally {
        this.scheduleRotationStatusRefresh()
      }
    },
    scheduleRotationStatusRefresh() {
      clearTimeout(this.rotationStatusTimer)
      if (
        this.disposed ||
        !['waiting_switch', 'ready_for_change', 'waiting_revert'].includes(this.object.status)
      ) {
        return
      }
      this.rotationStatusTimer = setTimeout(() => this.loadRotationStatus(), 5000)
    },
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
      const previousStatus = this.object.status
      if (previousStatus === 'idle') {
        try {
          await this.$confirm(this.$t('StartCredentialRotationConfirm'), this.$t('Warning'), {
            type: 'warning',
            confirmButtonClass: 'el-button--danger'
          })
        } catch {
          return
        }
      }
      this.actionLoading = true
      try {
        const updated = await advanceApplicationCredentialRotation(this.object)
        this.$emit('updated', updated)
        await this.loadRotationStatus()
        if (updated.status !== previousStatus) {
          this.$message.success(
            updated.status === 'idle' ? this.$t('RotationCompleted') : this.$t('StepCompleted')
          )
        } else if (previousStatus === 'changing_secret') {
          this.$message.info(this.$t('PamChangeStillRunning'))
        } else if (previousStatus === 'change_failed') {
          this.$message.warning(this.$t('PamChangeReadyForRetry'))
        } else if (previousStatus === 'recovery_required') {
          this.$message.warning(this.$t('PamRecoveryStillRequired'))
        }
      } catch (error) {
        if (error.response?.data?.rotation_status) {
          this.rotationStatus = error.response.data.rotation_status
        } else if (error.response?.data?.blockers) {
          await this.loadRotationStatus()
        }
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
      try {
        await this.$confirm(this.$t('ExecuteCredentialChangeConfirm'), this.$t('Warning'), {
          type: 'warning',
          confirmButtonClass: 'el-button--danger'
        })
      } catch {
        return
      }
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
      } else {
        try {
          await this.$confirm(this.$t('CancelCredentialRotationConfirm'), this.$t('Warning'), {
            type: 'warning',
            confirmButtonClass: 'el-button--danger'
          })
        } catch {
          return
        }
      }
      this.actionLoading = true
      try {
        const updated = await cancelApplicationCredentialRotation(this.object.id, reason)
        this.$emit('updated', updated)
        await this.loadRotationStatus()
        this.$message.success(this.$t('UpdateSuccessMsg'))
      } finally {
        this.actionLoading = false
      }
    },
    async refresh() {
      const [credential] = await Promise.all([
        getApplicationCredential(this.object.id),
        this.loadRotationStatus()
      ])
      this.$emit('updated', credential)
    }
  }
}
</script>

<style lang="scss" scoped>
.credential-info {
  display: grid;
  gap: 16px;
  margin-bottom: 16px;
  min-width: 0;
}

.rotation-steps {
  min-width: 0;
}

.rotation-steps :deep(.el-card__body) {
  overflow-x: auto;
}

.rotation-steps :deep(.el-steps) {
  min-width: 640px;
}

.rotation-steps :deep(.el-step__main) {
  min-width: 0;
  padding-right: 20px;
}

.rotation-steps :deep(.el-step:last-child .el-step__main) {
  padding-right: 0;
}

.rotation-steps :deep(.el-step__title) {
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: 600;
  line-height: 24px;
}

.rotation-steps :deep(.el-step__description) {
  padding-right: 0;
  color: var(--el-text-color-regular);
  line-height: 18px;
}
</style>
