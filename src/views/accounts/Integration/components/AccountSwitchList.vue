<template>
  <div>
    <GenericListTable ref="table" :header-actions="headerActions" :table-config="tableConfig" />
    <SwitchTaskDialog v-model:visible="createVisible" @created="taskCreated" />
    <el-dialog v-model="detailVisible" append-to-body width="960px">
      <template #header>
        <div class="dialog-title">
          <span>{{ $t('SwitchTaskDetail') }}</span>
          <el-tag :type="statusType(current?.status?.value)">
            {{ current?.status?.label || '-' }}
          </el-tag>
        </div>
      </template>

      <div v-if="current" v-loading="detailLoading" class="task-detail">
        <div class="task-overview">
          <div class="account-flow">
            <div class="account-node">
              <span>{{ $t('SourceAccount') }}</span>
              <strong>{{ accountLabel(current.source_account) }}</strong>
            </div>
            <el-icon class="flow-arrow"><Right /></el-icon>
            <div class="account-node account-node-target">
              <span>{{ $t('TargetAccount') }}</span>
              <strong>{{ accountLabel(current.target_account) }}</strong>
            </div>
          </div>
          <div class="task-meta">
            <span>{{ $t('CreatedBy') }}：{{ current.created_by || '-' }}</span>
            <span>{{ $t('DateCreated') }}：{{ formatDate(current.date_created) }}</span>
            <span>{{ $t('DateFinished') }}：{{ formatDate(current.date_finished) }}</span>
          </div>
          <div v-if="current.comment" class="task-comment">
            {{ $t('Comment') }}：{{ current.comment }}
          </div>
        </div>

        <section class="workflow-panel">
          <div class="section-title">
            <span>{{ $t('CurrentStatus') }}</span>
            <span class="progress-summary">
              {{ confirmedCount }} / {{ itemCount }} {{ $t('CredentialBinding') }}
            </span>
          </div>
          <el-steps
            :active="workflowActive"
            :process-status="workflowProcessStatus"
            align-center
            finish-status="success"
          >
            <el-step
              v-for="stepItem in workflowSteps"
              :key="stepItem.title"
              :description="stepItem.description"
              :title="stepItem.title"
            />
          </el-steps>
          <el-alert
            v-if="current.status?.value === 'ended'"
            :closable="false"
            :title="current.status.label"
            show-icon
            type="warning"
          />
        </section>

        <section>
          <div class="section-title">
            <span>{{ $t('AffectedBindingsSummary', { count: itemCount }) }}</span>
          </div>
          <el-table :data="current.items || []" border>
            <el-table-column :label="$t('Application')" min-width="160">
              <template #default="{ row }">{{ row.application?.name || '-' }}</template>
            </el-table-column>
            <el-table-column :label="$t('CredentialBindingID')" min-width="310">
              <template #default="{ row }">
                <span class="binding-id">
                  <code>{{ row.credential_id }}</code>
                  <el-button link type="primary" @click="copy(row.credential_id)">
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                </span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('Status')" min-width="170">
              <template #default="{ row }">
                <el-tag :type="statusType(row.status?.value)">
                  {{ row.status?.label || '-' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="$t('DateUpdated')" min-width="170">
              <template #default="{ row }">{{ formatDate(row.date_updated) }}</template>
            </el-table-column>
            <el-table-column :label="$t('Error')" min-width="180" show-overflow-tooltip>
              <template #default="{ row }">{{ row.error || '-' }}</template>
            </el-table-column>
            <el-table-column :label="$t('Actions')" width="120" fixed="right">
              <template #default="{ row }">
                <el-button v-if="canConfirm(row)" link type="primary" @click="confirm(row)">
                  {{ $t('ConfirmSwitched') }}
                </el-button>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
        </section>
      </div>
      <template #footer>
        <el-button
          v-if="canRollback"
          :disabled="!$hasPerm('accounts.change_integrationapplication')"
          type="danger"
          @click="rollback"
        >
          {{ $t('Rollback') }}
        </el-button>
        <el-button
          v-if="isActiveTask"
          :disabled="!$hasPerm('accounts.change_integrationapplication')"
          @click="endTask"
        >
          {{ $t('EndTask') }}
        </el-button>
        <el-button type="primary" @click="detailVisible = false">{{ $t('Close') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="jsx">
import { ActionsFormatter } from '@/components/Table/TableFormatters'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import { GenericListTable } from '@/layout/components'
import { copy } from '@/utils/common/index'
import SwitchTaskDialog from './SwitchTaskDialog.vue'

export default {
  name: 'ApplicationAccountSwitchList',
  components: { GenericListTable, SwitchTaskDialog },
  data() {
    const vm = this
    return {
      createVisible: false,
      current: null,
      detailLoading: false,
      detailVisible: false,
      headerActions: {
        hasImport: false,
        hasExport: false,
        onCreate: () => {
          vm.createVisible = true
        }
      },
      tableConfig: {
        url: '/api/v1/accounts/application-account-switches/',
        columnsShow: {
          default: [
            'source_account',
            'target_account',
            'status',
            'created_by',
            'date_created',
            'date_finished',
            'actions'
          ]
        },
        columnsMeta: {
          source_account: { formatter: (row) => vm.accountLabel(row.source_account) },
          target_account: { formatter: (row) => vm.accountLabel(row.target_account) },
          status: {
            formatter: (row) => (
              <el-tag type={vm.statusType(row.status?.value)}>{row.status?.label || '-'}</el-tag>
            )
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: false,
              hasDelete: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'detail',
                  title: this.$t('Detail'),
                  can: true,
                  callback: ({ row }) => vm.showDetail(row)
                }
              ]
            }
          }
        },
        permissions: { app: 'accounts', resource: 'integrationapplication' }
      }
    }
  },
  computed: {
    canRollback() {
      return ['running', 'waiting_confirmation'].includes(this.current?.status?.value)
    },
    itemCount() {
      return this.current?.items?.length || 0
    },
    isRollbackTask() {
      const status = this.current?.status?.value
      return (
        ['rolling_back', 'rolled_back'].includes(status) ||
        (this.current?.items || []).some((item) => item.status?.value?.startsWith('rollback'))
      )
    },
    deliveredCount() {
      const finishedStatuses = this.isRollbackTask
        ? ['rollback_delivered', 'rolled_back']
        : ['delivered', 'confirmed']
      return (this.current?.items || []).filter((item) =>
        finishedStatuses.includes(item.status?.value)
      ).length
    },
    confirmedCount() {
      const finishedStatus = this.isRollbackTask ? 'rolled_back' : 'confirmed'
      return (this.current?.items || []).filter((item) => item.status?.value === finishedStatus)
        .length
    },
    isActiveTask() {
      return ['running', 'waiting_confirmation', 'rolling_back'].includes(
        this.current?.status?.value
      )
    },
    workflowActive() {
      const status = this.current?.status?.value
      if (['completed', 'rolled_back'].includes(status)) return 4
      if (this.itemCount > 0 && this.confirmedCount === this.itemCount) return 3
      if (this.itemCount > 0 && this.deliveredCount === this.itemCount) return 2
      return 1
    },
    workflowProcessStatus() {
      const hasFailedItem = (this.current?.items || []).some(
        (item) => item.status?.value === 'failed'
      )
      return hasFailedItem ? 'error' : 'process'
    },
    workflowSteps() {
      const ratio = (value) => `${value} / ${this.itemCount}`
      return [
        {
          title: this.isRollbackTask ? this.$t('Rollback') : this.$t('CreateSwitchTask'),
          description: this.formatDate(
            this.isRollbackTask ? this.current?.date_updated : this.current?.date_created
          )
        },
        { title: this.$t('Agent'), description: ratio(this.deliveredCount) },
        {
          title: this.isRollbackTask ? this.$t('Confirm') : this.$t('ConfirmSwitched'),
          description: ratio(this.confirmedCount)
        },
        {
          title: ['completed', 'rolled_back'].includes(this.current?.status?.value)
            ? this.current.status.label
            : this.$t('Completed'),
          description: this.formatDate(this.current?.date_finished)
        }
      ]
    }
  },
  methods: {
    copy,
    accountLabel(account) {
      return account ? `${account.name} (${account.username})` : '-'
    },
    canConfirm(item) {
      return ['delivered', 'rollback_delivered'].includes(item.status?.value)
    },
    formatDate(value) {
      return value ? toSafeLocalDateStr(value) : '-'
    },
    statusType(status) {
      return (
        {
          completed: 'success',
          confirmed: 'success',
          delivered: 'warning',
          ended: 'info',
          failed: 'danger',
          pending: 'info',
          rolled_back: 'info',
          rollback_delivered: 'warning',
          rollback_pending: 'warning',
          rolling_back: 'warning',
          running: 'primary',
          waiting_confirmation: 'warning'
        }[status] || 'info'
      )
    },
    taskCreated() {
      this.$refs.table.reloadTable()
    },
    async showDetail(row) {
      this.detailVisible = true
      this.detailLoading = true
      try {
        this.current = await this.$axios.get(
          `/api/v1/accounts/application-account-switches/${row.id}/`
        )
      } finally {
        this.detailLoading = false
      }
    },
    async reloadCurrent() {
      const id = this.current.id
      this.current = await this.$axios.get(`/api/v1/accounts/application-account-switches/${id}/`)
      this.$refs.table.reloadTable()
    },
    async confirm(item) {
      await this.$confirm(this.$t('ConfirmSwitchedPrompt', { app: item.application?.name }))
      await this.$axios.post(
        `/api/v1/accounts/application-account-switches/${this.current.id}/confirm/`,
        { item_id: item.id }
      )
      this.$message.success(this.$t('ConfirmSuccess'))
      await this.reloadCurrent()
    },
    async rollback() {
      await this.$confirm(this.$t('RollbackSwitchTaskConfirm'))
      await this.$axios.post(
        `/api/v1/accounts/application-account-switches/${this.current.id}/rollback/`
      )
      this.$message.success(this.$t('RollbackRequested'))
      await this.reloadCurrent()
    },
    async endTask() {
      await this.$confirm(this.$t('EndSwitchTaskConfirm'))
      await this.$axios.post(
        `/api/v1/accounts/application-account-switches/${this.current.id}/end/`
      )
      this.$message.success(this.$t('TaskEnded'))
      await this.reloadCurrent()
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
}

.task-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 65vh;
  padding-right: 2px;
  overflow-y: auto;
}

.task-overview,
.workflow-panel {
  padding: 18px 20px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
}

.task-overview {
  background: var(--el-fill-color-lighter);
}

.account-flow {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 32px minmax(0, 1fr);
  align-items: center;
  gap: 16px;
}

.account-node {
  display: flex;
  flex-direction: column;
  gap: 6px;

  span {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  strong {
    overflow: hidden;
    color: var(--el-text-color-primary);
    font-size: 15px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.account-node-target {
  text-align: right;
}

.flow-arrow {
  color: var(--el-color-primary);
  font-size: 22px;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  padding-top: 14px;
  margin-top: 14px;
  border-top: 1px solid var(--el-border-color-lighter);
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.task-comment {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
  font-size: 15px;
  font-weight: 600;
}

.progress-summary {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  font-weight: 400;
}

.binding-id {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.workflow-panel :deep(.el-alert) {
  margin-top: 16px;
}

.workflow-panel :deep(.el-step__description) {
  margin-top: 4px;
  font-size: 12px;
}
</style>
