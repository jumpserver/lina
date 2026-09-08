<template>
  <TwoCol :gutter="20" :left="16" :right="8">
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
import {
  advanceApplicationCredentialRotation,
  cancelApplicationCredentialRotation,
  getApplicationCredential,
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
    return { actionLoading: false }
  },
  computed: {
    rotationStep() {
      if (this.object.status === 'idle') {
        return this.object.date_last_rotated ? this.rotationSteps.length : 0
      }
      const dual = {
        waiting_backup: 0,
        ready_for_change: 1,
        changing_secret: 2,
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
          value: this.object.is_active,
          formatter: (_item, value) => (
            <el-tag type={value ? 'success' : 'info'}>
              {value ? this.$t('Enabled') : this.$t('Disabled')}
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
                ? this.$t('StartRotation')
                : this.object.status === 'ready_for_change'
                  ? this.$t('ChangeSecret')
                  : this.object.status === 'changing_secret'
                    ? this.$t('CheckSecretChangeResult')
                    : this.$t('ContinueRotation'),
            loading: this.actionLoading,
            disabled:
              !this.object.is_active ||
              (this.object.status === 'ready_for_change' &&
                !this.$hasPerm('accounts.add_changesecretautomation'))
          },
          callbacks: { click: this.advanceRotation }
        },
        {
          title: this.$t('ChangeSecret'),
          has:
            this.object.type === 'rotation' &&
            this.object.status === 'changing_secret' &&
            this.$hasPerm('accounts.change_applicationcredential') &&
            this.$hasPerm('accounts.add_changesecretautomation'),
          attrs: {
            label: this.$t('Create'),
            disabled: this.actionLoading || !this.object.is_active
          },
          callbacks: { click: this.openChangeSecretForm }
        },
        {
          title: this.$t('Cancel'),
          has:
            this.object.type === 'rotation' &&
            ['waiting_backup', 'ready_for_change'].includes(this.object.status) &&
            this.$hasPerm('accounts.change_applicationcredential'),
          attrs: { label: this.$t('CancelRotation'), disabled: this.actionLoading },
          callbacks: { click: this.cancelRotation }
        },
        {
          title: this.$t('Status'),
          attrs: { label: this.$t('Refresh'), disabled: this.actionLoading },
          callbacks: { click: this.refresh }
        }
      ]
    }
  },
  methods: {
    formatDate(value) {
      return value ? toSafeLocalDateStr(value) : '-'
    },
    async advanceRotation() {
      const createTask = this.object.status === 'ready_for_change'
      if (createTask && !this.$hasPerm('accounts.add_changesecretautomation')) return
      this.actionLoading = true
      try {
        const updated = await advanceApplicationCredentialRotation(this.object)
        this.$emit('updated', updated)
        if (createTask) {
          await this.openChangeSecretForm()
          return
        }
        this.$message.success(
          updated.status === 'idle' ? this.$t('RotationCompleted') : this.$t('StepCompleted')
        )
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
        query: { application_credential: this.object.id }
      })
    },
    async cancelRotation() {
      this.actionLoading = true
      try {
        const updated = await cancelApplicationCredentialRotation(this.object.id)
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
