<template>
  <TwoCol :gutter="20" :left="17" :right="7">
    <AutoDetailCard
      :key="detailCardKey"
      :fields="detailFields"
      :object="object"
      :url="detailUrl"
      class="detail-block"
    />

    <IBox :title="$t('AffectedApplications')" class="detail-block applications-card">
      <el-table v-loading="applicationsLoading" :data="applications" row-key="id">
        <el-table-column :label="$t('Applications')" min-width="180">
          <template #default="{ row }">
            {{ row.name }}
            <div class="cell-secondary">{{ row.instanceId }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('ClientType')" width="130">
          <template #default="{ row }">
            {{ row.accessMode === 'sdk' ? $t('PythonSDK') : $t('AgentAccess') }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('ClientStatus')" width="110">
          <template #default="{ row }">
            <el-tag :type="row.online ? 'success' : 'info'" size="small">
              {{ row.online ? $t('Online') : $t('Offline') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('AppliedAccount')" min-width="130">
          <template #default="{ row }">
            <el-tag
              :type="row.appliedAccount === backupAccount ? 'success' : 'warning'"
              effect="plain"
              size="small"
            >
              {{ row.appliedAccount }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('LastReportedAt')" min-width="175" prop="reportedAt" />
      </el-table>
    </IBox>

    <template #right>
      <QuickActions :actions="detailActions" :title="$t('CurrentAction')" class="detail-block" />

      <IBox :title="$t('RotationProgress')" class="detail-block rotation-steps">
        <el-steps :active="activeStep" direction="vertical" finish-status="success">
          <el-step :description="$t('WaitingForClientReport')" :title="$t('SwitchingToBackup')" />
          <el-step :description="$t('SecretChangeGuard')" :title="$t('CheckUsageStatus')" />
          <el-step :description="$t('ReadyForSecretChange')" :title="$t('ChangeAndVerifySecret')" />
          <el-step
            :description="$t('AllApplicationsOnBackup')"
            :title="$t('SwitchBackToPrimary')"
          />
          <el-step :title="$t('RotationCompleted')" />
        </el-steps>
      </IBox>
    </template>
  </TwoCol>
</template>

<script lang="jsx">
import {
  listCredentialBindings,
  listCredentialClients,
  runCredentialPolicyAction
} from '@/api/accountRotation'
import { IBox, QuickActions } from '@/components'
import AutoDetailCard from '@/components/Cards/DetailCard/auto.vue'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

const valueOf = (value) => value?.value ?? value
const resultsOf = (value) => (Array.isArray(value) ? value : value?.results || [])
const accountName = (value) => value?.username || value?.name || '-'

export default {
  name: 'AccountRotationInfo',
  components: {
    AutoDetailCard,
    IBox,
    QuickActions,
    TwoCol
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['refresh', 'reload-table'],
  data() {
    return {
      actionLoading: false,
      applications: [],
      applicationsLoading: false
    }
  },
  computed: {
    status() {
      return valueOf(this.object.status)
    },
    backupAccount() {
      return accountName(this.object.backup_account)
    },
    detailUrl() {
      return `/api/v1/accounts/credential-policies/${this.object.id}/`
    },
    detailCardKey() {
      return `${this.object.id || ''}-${this.object.revision || 0}-${this.status || ''}`
    },
    detailFields() {
      const asset = this.object.asset || {}
      const platform = asset.platform || {}
      return [
        { key: this.$t('RotationPurpose'), value: this.object.name },
        { key: this.$t('CredentialKey'), value: this.object.key },
        {
          key: this.$t('Asset'),
          value: asset.name ? `${asset.name} (${asset.address || '-'})` : '-'
        },
        { key: this.$t('AssetType'), value: platform.name || platform.type || '-' },
        { key: this.$t('PrimaryAccount'), value: accountName(this.object.primary_account) },
        { key: this.$t('BackupAccount'), value: this.backupAccount },
        { key: this.$t('ActiveAccount'), value: accountName(this.object.published_account) },
        {
          key: this.$t('CurrentStatus'),
          value: this.status,
          formatter: () => (
            <el-tag type={this.statusMeta.type} size="small">
              {this.statusMeta.label}
            </el-tag>
          )
        },
        { key: this.$t('LastRotation'), value: this.object.date_last_rotated || '-' }
      ]
    },
    statusMeta() {
      const statusMap = {
        idle: { label: this.$t('RotationNormal'), type: 'info' },
        waiting_backup: { label: this.$t('WaitingForApplications'), type: 'warning' },
        ready_for_change: { label: this.$t('ReadyForSecretChange'), type: 'success' },
        waiting_primary: { label: this.$t('SwitchingBack'), type: 'primary' }
      }
      return statusMap[this.status] || { label: this.status || '-', type: 'info' }
    },
    activeStep() {
      const steps = {
        idle: 0,
        waiting_backup: 1,
        ready_for_change: 2,
        waiting_primary: 3
      }
      return steps[this.status] || 0
    },
    currentActionLabel() {
      const labels = {
        idle: 'StartRotation',
        waiting_backup: 'CheckUsageStatus',
        ready_for_change: 'CheckSecretChangeResult',
        waiting_primary: 'ConfirmApplicationsBack'
      }
      return this.$t(labels[this.status] || 'StartRotation')
    },
    detailActions() {
      return [
        {
          title: this.$t('NextStep'),
          attrs: {
            type: 'primary',
            label: this.currentActionLabel,
            loading: this.actionLoading
          },
          callbacks: { click: this.handleCurrentAction }
        },
        {
          title: this.$t('AccountChangeSecret'),
          has: this.status === 'ready_for_change',
          attrs: { label: this.$t('GoChangeSecret') },
          callbacks: { click: this.openChangeSecret }
        },
        {
          title: this.$t('Cancel'),
          has: ['waiting_backup', 'ready_for_change'].includes(this.status),
          attrs: { label: this.$t('CancelRotation') },
          callbacks: { click: this.cancelRotation }
        }
      ]
    }
  },
  watch: {
    'object.id': {
      immediate: true,
      handler(id) {
        if (id) this.loadApplications()
      }
    }
  },
  methods: {
    async loadApplications() {
      this.applicationsLoading = true
      try {
        const [bindingData, clientData] = await Promise.all([
          listCredentialBindings({ policy: this.object.id, limit: 100 }),
          listCredentialClients({ policy: this.object.id, limit: 100 })
        ])
        const clients = resultsOf(clientData)
        const applications = clients.map((client) => {
          const state = (client.credential_statuses || []).find(
            (item) => item.policy?.id === this.object.id
          )
          return {
            id: client.id,
            name: client.application?.name || '-',
            instanceId: client.instance_id,
            accessMode: valueOf(client.type),
            online: client.online,
            appliedAccount: accountName(state?.applied_account),
            reportedAt: this.formatDate(state?.date_last_seen || client.date_last_seen)
          }
        })
        resultsOf(bindingData).forEach((binding) => {
          if (clients.some((client) => client.application?.id === binding.application?.id)) return
          applications.push({
            id: binding.id,
            name: binding.application?.name || '-',
            instanceId: '-',
            accessMode: valueOf(binding.application?.credential_access_mode),
            online: false,
            appliedAccount: '-',
            reportedAt: '-'
          })
        })
        this.applications = applications
      } finally {
        this.applicationsLoading = false
      }
    },
    formatDate(value) {
      return value ? toSafeLocalDateStr(value) : '-'
    },
    async handleCurrentAction() {
      const action = {
        idle: 'start',
        waiting_backup: 'check-usage',
        ready_for_change: 'check-secret-change',
        waiting_primary: 'complete'
      }[this.status]
      if (!action || this.actionLoading) return
      await this.runAction(action)
    },
    async cancelRotation() {
      if (this.actionLoading) return
      await this.runAction('cancel')
    },
    async runAction(action) {
      this.actionLoading = true
      try {
        const policy = await runCredentialPolicyAction(this.object.id, action)
        this.$emit('refresh', policy)
        this.$emit('reload-table')
        await this.loadApplications()
        this.$message.success(this.$t('UpdateSuccessMsg'))
      } catch (error) {
        const blockers = error.response?.data?.blockers || []
        if (blockers.length) {
          this.$message.warning(
            this.$t('ApplicationsStillUsingAccount', { count: blockers.length })
          )
          return
        }
        const detail = error.response?.data?.detail
        if (detail) this.$message.error(detail)
      } finally {
        this.actionLoading = false
      }
    },
    openChangeSecret() {
      this.$router.push({ name: 'AccountChangeSecretList' })
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-block {
  margin-bottom: 15px;
}

.applications-card :deep(.el-card__body) {
  padding: 0;
}

.cell-secondary {
  display: block;
  margin-top: 2px;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.rotation-steps {
  :deep(.el-step__main) {
    min-width: 0;
    padding-bottom: 18px;
  }

  :deep(.el-step__title) {
    color: var(--color-text-primary);
    font-size: 14px;
    font-weight: 600;
    line-height: 24px;
  }

  :deep(.el-step__description) {
    padding-right: 0;
    color: var(--color-help-text);
    line-height: 22px;
  }
}
</style>
