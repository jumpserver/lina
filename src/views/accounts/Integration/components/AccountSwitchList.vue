<template>
  <div>
    <GenericListTable ref="table" :header-actions="headerActions" :table-config="tableConfig" />
    <SwitchTaskDialog v-model:visible="createVisible" @created="taskCreated" />
    <Drawer
      :title="$t('SwitchTaskDetail')"
      :visible="detailVisible"
      @update:visible="detailVisible = $event"
    >
      <div v-loading="detailLoading" class="task-detail">
        <el-row v-if="current" :gutter="20">
          <el-col :md="17" :sm="24">
            <IBox :title="$t('BasicInfo')" class="detail-card">
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">{{ $t('ID') }}:</span>
                  <span class="detail-value">{{ current.id || '-' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">{{ $t('Status') }}:</span>
                  <el-tag size="small" :type="statusType(current.status?.value)">
                    {{ current.status?.label || '-' }}
                  </el-tag>
                </div>
                <div class="detail-item">
                  <span class="detail-label">{{ $t('CreatedBy') }}:</span>
                  <span class="detail-value">{{ current.created_by || '-' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">{{ $t('DateCreated') }}:</span>
                  <span class="detail-value">{{ formatDate(current.date_created) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">{{ $t('DateFinished') }}:</span>
                  <span class="detail-value">{{ formatDate(current.date_finished) }}</span>
                </div>
                <div class="detail-item detail-item-full">
                  <span class="detail-label">{{ $t('Comment') }}:</span>
                  <span class="detail-value">{{ current.comment || '-' }}</span>
                </div>
              </div>
            </IBox>

            <IBox :title="$t('Account')" class="detail-card">
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
            </IBox>

            <IBox
              :title="$t('AffectedBindingsSummary', { count: itemCount })"
              class="detail-card bindings-card"
            >
              <div v-if="itemCount" class="binding-list">
                <div v-for="item in current.items" :key="item.id" class="binding-item">
                  <div class="binding-content">
                    <div class="binding-heading">
                      <strong>{{ item.application?.name || '-' }}</strong>
                      <el-tag size="small" :type="statusType(item.status?.value)">
                        {{ item.status?.label || '-' }}
                      </el-tag>
                    </div>
                    <div class="binding-meta">
                      <span>
                        <b>{{ $t('CredentialBindingID') }}:</b>
                        <span class="binding-id">
                          <code>{{ item.credential_id }}</code>
                          <el-button link type="primary" @click="copy(item.credential_id)">
                            <el-icon><CopyDocument /></el-icon>
                          </el-button>
                        </span>
                      </span>
                      <span>
                        <b>{{ $t('DateUpdated') }}:</b>
                        {{ formatDate(item.date_updated) }}
                      </span>
                      <span v-if="item.error" class="binding-error">
                        <b>{{ $t('Error') }}:</b>
                        {{ item.error }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <el-empty v-else :image-size="64" />
              <div
                v-if="confirmableItems.length || canRollback || isActiveTask"
                class="task-actions"
              >
                <el-button
                  v-for="item in confirmableItems"
                  :key="`confirm-${item.id}`"
                  size="small"
                  type="primary"
                  @click="confirm(item)"
                >
                  <i class="fa fa-check" />
                  <span v-if="itemCount > 1">{{ item.application?.name || '-' }} · </span>
                  {{ $t('ConfirmSwitched') }}
                </el-button>
                <el-button
                  v-if="canRollback"
                  :disabled="!$hasPerm('accounts.change_integrationapplication')"
                  size="small"
                  type="warning"
                  @click="rollback"
                >
                  <i class="fa fa-undo" />
                  {{ $t('Rollback') }}
                </el-button>
                <el-button
                  v-if="isActiveTask"
                  :disabled="!$hasPerm('accounts.change_integrationapplication')"
                  size="small"
                  type="danger"
                  @click="endTask"
                >
                  <i class="fa fa-times" />
                  {{ $t('EndTask') }}
                </el-button>
              </div>
            </IBox>
          </el-col>

          <el-col :md="7" :sm="24">
            <IBox :title="$t('CurrentStatus')" class="workflow-card">
              <div class="progress-summary">
                {{ confirmedCount }} / {{ itemCount }} {{ $t('CredentialBinding') }}
              </div>
              <el-steps
                :active="workflowActive"
                :process-status="workflowProcessStatus"
                direction="vertical"
                finish-status="success"
              >
                <el-step v-for="stepItem in workflowSteps" :key="stepItem.title">
                  <template #title>{{ stepItem.title }}</template>
                  <template #description>
                    <div class="step-description">{{ stepItem.description }}</div>
                  </template>
                </el-step>
              </el-steps>
              <el-alert
                v-if="current.status?.value === 'ended'"
                :closable="false"
                :title="current.status.label"
                show-icon
                type="warning"
              />
            </IBox>
          </el-col>
        </el-row>
      </div>
    </Drawer>
  </div>
</template>

<script lang="jsx">
import { ActionsFormatter } from '@/components/Table/TableFormatters'
import Drawer from '@/components/Drawer'
import IBox from '@/components/Common/IBox'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import { GenericListTable } from '@/layout/components'
import { copy } from '@/utils/common/index'
import SwitchTaskDialog from './SwitchTaskDialog.vue'

const SWITCH_STATUS_TYPE_MAP = {
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
}

export default {
  name: 'ApplicationAccountSwitchList',
  components: { Drawer, GenericListTable, IBox, SwitchTaskDialog },
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
        name: 'ApplicationAccountSwitchList',
        url: '/api/v1/accounts/application-account-switches/',
        columnsShow: {
          min: ['actions'],
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
          source_account: {
            label: this.$t('SourceAccount'),
            formatter: (row) => vm.accountLabel(row.source_account)
          },
          target_account: {
            label: this.$t('TargetAccount'),
            formatter: (row) => vm.accountLabel(row.target_account)
          },
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
    confirmableItems() {
      return (this.current?.items || []).filter((item) => this.canConfirm(item))
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
      return SWITCH_STATUS_TYPE_MAP[status] || 'info'
    },
    taskCreated() {
      this.$refs.table.reloadTable()
    },
    async showDetail(row) {
      this.current = null
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
.task-detail {
  min-height: calc(100vh - 56px);
  padding: 16px;
  box-sizing: border-box;
}

.detail-card {
  margin-bottom: 16px;
}

.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px 24px;
  color: var(--el-text-color-regular);
  font-size: 13px;
}

.detail-item {
  display: flex;
  min-width: 0;
  gap: 4px;
}

.detail-item-full {
  grid-column: 1 / -1;
}

.detail-label {
  flex: 0 0 auto;
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.detail-value {
  min-width: 0;
  overflow-wrap: anywhere;
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

.progress-summary {
  margin-bottom: 16px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.binding-id {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.binding-list {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}

.binding-item {
  display: flex;
  align-items: center;
  padding: 16px;

  & + & {
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

.binding-content {
  min-width: 0;
}

.binding-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  color: var(--el-text-color-primary);
  font-size: 14px;
}

.binding-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 24px;
  color: var(--el-text-color-secondary);
  font-size: 13px;

  b {
    color: var(--el-text-color-regular);
    font-weight: 500;
  }
}

.binding-error {
  width: 100%;
  color: var(--el-color-danger);
  overflow-wrap: anywhere;
}

.task-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;

  :deep(.el-button) {
    min-height: 30px;
    height: 30px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 400;
    line-height: 1;
  }
}

.workflow-card {
  min-height: calc(100vh - 88px);
}

.workflow-card :deep(.el-card__body) {
  min-height: calc(100vh - 139px);
}

.workflow-card :deep(.el-steps) {
  height: 660px;
}

.workflow-card :deep(.el-step__description) {
  font-size: 12px;
}

.workflow-card :deep(.el-alert) {
  margin-top: 16px;
}

.step-description {
  padding-top: 4px;
  white-space: pre-line;
}

@media (max-width: 991px) {
  .binding-item {
    align-items: flex-start;
    flex-direction: column;
  }

  .workflow-card {
    min-height: 520px;
  }

  .workflow-card :deep(.el-card__body) {
    min-height: 470px;
  }

  .workflow-card :deep(.el-steps) {
    height: 420px;
  }
}
</style>
