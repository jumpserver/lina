<template>
  <GenericListTable ref="leaseTable" :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script lang="jsx">
import {
  ActionsFormatter,
  DateFormatter,
  ObjectRelatedFormatter
} from '@/components/Table/TableFormatters'
import { GenericListTable } from '@/layout/components'
import { openTaskPage } from '@/utils/jms/index'

const LEASE_URL = '/api/v1/accounts/credential-leases/'
const STATUS_TYPES = {
  active: 'success',
  revoking: 'warning',
  revoked: 'info',
  expired: 'info'
}

export default {
  name: 'CredentialLeases',
  components: { GenericListTable },
  props: {
    policyId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    const vm = this
    return {
      operationTasks: {},
      headerActions: {
        hasCreate: false,
        hasLeftActions: false,
        hasMoreActions: false,
        hasImport: false,
        hasExport: false,
        hasRefresh: true,
        searchConfig: { getUrlQuery: false }
      },
      tableConfig: {
        url: `${LEASE_URL}?policy=${encodeURIComponent(this.policyId)}&ordering=status,-date_created`,
        permissions: { app: 'accounts', resource: 'credentiallease' },
        columns: [
          'username',
          'account',
          'status',
          'ttl',
          'date_expires',
          'date_max_expires',
          'actions'
        ],
        columnsMeta: {
          username: { minWidth: '170px' },
          account: { minWidth: '160px', formatter: ObjectRelatedFormatter },
          status: {
            minWidth: '220px',
            formatter: (row) => vm.renderOperationStatus(row)
          },
          ttl: {
            width: '120px',
            formatter: (row) => vm.formatSeconds(row.ttl)
          },
          date_expires: { width: '170px', formatter: DateFormatter },
          date_max_expires: { width: '170px', formatter: DateFormatter },
          actions: {
            width: '100px',
            formatter: ActionsFormatter,
            formatterArgs: {
              squareButtons: true,
              hasUpdate: false,
              hasDelete: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'renew',
                  title: this.$t('Renew'),
                  icon: 'fa-solid fa-clock-rotate-left',
                  type: 'primary',
                  order: 1,
                  has: ({ row }) => row.renewable,
                  can: vm.$hasPerm('accounts.change_credentiallease'),
                  callback: ({ row }) => vm.renewLease(row)
                },
                {
                  name: 'revoke',
                  title: this.$t('Revoke'),
                  type: 'danger',
                  order: 2,
                  has: ({ row }) => ['active', 'revoking'].includes(vm.choiceValue(row.status)),
                  can: ({ row }) =>
                    vm.$hasPerm('accounts.change_credentiallease') &&
                    vm.choiceValue(row.status) === 'active',
                  tip: ({ row }) =>
                    vm.choiceValue(row.status) === 'revoking'
                      ? vm.$t('CredentialRevokingHint')
                      : vm.$t('Revoke'),
                  callback: ({ row }) => vm.confirmRevoke(row)
                }
              ]
            }
          }
        }
      }
    }
  },
  created() {
    this.operationPollers = {}
  },
  beforeUnmount() {
    Object.values(this.operationPollers).forEach(clearTimeout)
  },
  methods: {
    choiceValue(value) {
      return value && typeof value === 'object' ? value.value : value
    },
    operationTask(row, status) {
      return this.operationTasks[row.id] || (status === 'revoking' && row.revoke_task_id) || ''
    },
    renderOperationStatus(row) {
      const status = this.choiceValue(row.status)
      const label = row.status?.label || status || '-'
      const hint = status === 'revoking' ? this.$t('CredentialRevokingHint') : row.revoke_error
      const task = this.operationTask(row, status)
      return (
        <div class="credential-status">
          <el-tag disable-transitions size="small" type={STATUS_TYPES[status] || 'info'}>
            {label}
          </el-tag>
          {hint ? (
            <span class="credential-status__hint" title={hint}>
              {hint}
            </span>
          ) : null}
          {task ? (
            <el-link
              aria-label={this.$t('ViewTask')}
              class="credential-status__task"
              type="primary"
              underline="never"
              onClick={(event) => {
                event.stopPropagation()
                openTaskPage(task)
              }}
            >
              {this.$t('ViewTask')}
            </el-link>
          ) : null}
        </div>
      )
    },
    formatSeconds(seconds) {
      if (seconds === null || seconds === undefined) return '-'
      const units = [
        [86400, 'Day'],
        [3600, 'Hour'],
        [60, 'Minute']
      ]
      for (const [size, label] of units) {
        if (seconds >= size && seconds % size === 0) {
          const value = seconds / size
          return `${value} ${this.$tc(label, value)}`
        }
      }
      return `${seconds} ${this.$tc('Second', seconds)}`
    },
    async renewLease(row) {
      await this.$axios.post(`${LEASE_URL}${row.id}/renew/`, {})
      this.$message.success(this.$t('CredentialLeaseRenewed'))
      this.reloadTable()
    },
    async confirmRevoke(row) {
      try {
        await this.$confirm(
          this.$t('RevokeCredentialConfirm', { username: row.username }),
          this.$t('Info'),
          { type: 'warning', closeOnPressEscape: true }
        )
      } catch {
        return
      }
      const response = await this.$axios.post(`${LEASE_URL}${row.id}/revoke/`, {})
      this.reloadTable()
      if (response.task) {
        this.$message.success(this.$t('CredentialOperationAccepted'))
        this.startOperationPolling(row.id, response.task)
        openTaskPage(response.task)
      } else {
        this.$message.success(this.$t('CredentialOperationCompleted'))
      }
    },
    startOperationPolling(id, task) {
      this.operationTasks[id] = task
      clearTimeout(this.operationPollers[id])
      this.operationPollers[id] = setTimeout(() => this.pollOperation(id, 60), 3000)
    },
    async pollOperation(id, attemptsLeft) {
      let lease
      try {
        lease = await this.$axios.get(`${LEASE_URL}${id}/`, {
          disableFlashErrorMsg: true
        })
      } catch {
        delete this.operationPollers[id]
        this.$message.warning(this.$t('CredentialStatusRefreshStopped'))
        return
      }

      this.reloadTable()
      if (this.choiceValue(lease.status) !== 'revoking') {
        delete this.operationPollers[id]
        delete this.operationTasks[id]
        const failed = lease.revoke_succeeded === false || Boolean(lease.revoke_error)
        this.$message[failed ? 'error' : 'success'](
          this.$t(failed ? 'CredentialOperationFailed' : 'CredentialOperationCompleted')
        )
        return
      }

      if (attemptsLeft <= 1) {
        delete this.operationPollers[id]
        this.$message.warning(this.$t('CredentialStatusRefreshStopped'))
        return
      }
      this.operationPollers[id] = setTimeout(() => this.pollOperation(id, attemptsLeft - 1), 5000)
    },
    reloadTable() {
      this.$refs.leaseTable?.reloadTable?.()
    }
  }
}
</script>

<style lang="scss" scoped>
.credential-status {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  min-width: 0;
}

.credential-status__hint {
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.4;
  white-space: normal;
}

.credential-status__task {
  font-size: 12px;
}
</style>
