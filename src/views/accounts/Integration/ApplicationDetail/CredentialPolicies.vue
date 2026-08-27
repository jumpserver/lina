<template>
  <DrawerListTable
    ref="policyTable"
    :create-drawer="policyForm"
    :detail-drawer="policyDetail"
    :drawer-props="{ application: object }"
    :header-actions="policyHeaderActions"
    :resource="$t('CredentialPolicy')"
    :table-config="policyTableConfig"
    :update-drawer="policyForm"
  />
</template>

<script lang="jsx">
import DrawerListTable from '@/components/Table/DrawerListTable/index.vue'
import {
  ActionsFormatter,
  ChoicesFormatter,
  CopyableFormatter,
  DetailFormatter,
  ObjectRelatedFormatter
} from '@/components/Table/TableFormatters'
import { openTaskPage } from '@/utils/jms/index'

const POLICY_URL = '/api/v1/accounts/credential-policies/'
const STATUS_TYPES = {
  enabled: 'success',
  rotating: 'warning',
  disabling: 'warning',
  disabled: 'info',
  uncertain: 'danger'
}
const OPERATION_STATUSES = ['rotating', 'disabling']

export default {
  name: 'CredentialPolicies',
  components: { DrawerListTable },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  data() {
    const vm = this

    return {
      policyForm: () => import('./CredentialPolicyCreateUpdate.vue'),
      policyDetail: () => import('./CredentialPolicyDetail.vue'),
      operationTasks: {},
      policyHeaderActions: {
        hasBulkDelete: false,
        hasMoreActions: false,
        hasImport: false,
        hasExport: false,
        hasRefresh: true,
        canCreate: this.$hasPerm('accounts.add_credentialpolicy'),
        createTitle: this.$t('Create'),
        searchConfig: { getUrlQuery: false }
      },
      policyTableConfig: {
        url: `${POLICY_URL}?application=${encodeURIComponent(this.object.id)}`,
        permissions: { app: 'accounts', resource: 'credentialpolicy' },
        columns: ['name', 'id', 'mode', 'asset', 'binding', 'status', 'lifetime', 'actions'],
        columnsExtra: ['binding', 'lifetime'],
        columnsMeta: {
          name: {
            minWidth: '180px',
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: true,
              getDrawerTitle: ({ row }) => row.name
            }
          },
          id: {
            width: '300px',
            formatter: CopyableFormatter
          },
          mode: {
            width: '140px',
            formatter: ChoicesFormatter,
            formatterArgs: { showIcon: false }
          },
          asset: {
            minWidth: '160px',
            formatter: ObjectRelatedFormatter
          },
          binding: {
            label: this.$t('AccountOrTemplate'),
            minWidth: '170px',
            formatter: (row) => vm.bindingText(row)
          },
          status: {
            minWidth: '140px',
            formatter: (row) => vm.renderOperationStatus(row, 'policy')
          },
          lifetime: {
            label: this.$t('RotationOrTTL'),
            minWidth: '150px',
            formatter: (row) => vm.lifetimeText(row)
          },
          actions: {
            width: '100px',
            formatter: ActionsFormatter,
            formatterArgs: {
              squareButtons: true,
              hasClone: false,
              canUpdate: ({ row }) =>
                vm.$hasPerm('accounts.change_credentialpolicy') &&
                !['rotating', 'disabling'].includes(vm.choiceValue(row.status)),
              updateTip: ({ row }) => vm.policyActionTip(row, 'Edit'),
              canDelete: ({ row }) =>
                vm.$hasPerm('accounts.delete_credentialpolicy') &&
                vm.choiceValue(row.status) === 'disabled',
              deleteTip: ({ row }) => vm.deletePolicyTip(row),
              extraActions: [
                {
                  name: 'log',
                  title: this.$t('Log'),
                  icon: 'fa-terminal',
                  type: 'primary',
                  order: 1,
                  has: ({ row }) => Boolean(vm.operationTask(row, vm.choiceValue(row.status))),
                  callback: ({ row }) =>
                    openTaskPage(vm.operationTask(row, vm.choiceValue(row.status)))
                },
                {
                  name: 'rotate',
                  title: this.$t('RotateNow'),
                  icon: 'fa-solid fa-rotate',
                  type: 'primary',
                  order: 2,
                  has: ({ row }) => vm.choiceValue(row.mode) === 'static',
                  can: ({ row }) =>
                    vm.$hasPerm('accounts.change_credentialpolicy') &&
                    !['rotating', 'disabling'].includes(vm.choiceValue(row.status)),
                  tip: ({ row }) => vm.policyActionTip(row, 'RotateNow'),
                  callback: ({ row }) => vm.confirmPolicyAction(row, 'rotate')
                },
                {
                  name: 'disable',
                  title: this.$t('Disable'),
                  order: 12,
                  has: ({ row }) => !['disabled', 'disabling'].includes(vm.choiceValue(row.status)),
                  can: vm.$hasPerm('accounts.change_credentialpolicy'),
                  tip: vm.$hasPerm('accounts.change_credentialpolicy')
                    ? this.$t('Disable')
                    : this.$t('NoPermission'),
                  callback: ({ row }) => vm.confirmPolicyAction(row, 'disable')
                },
                {
                  name: 'enable',
                  title: this.$t('Enable'),
                  type: 'success',
                  order: 12,
                  has: ({ row }) => vm.choiceValue(row.status) === 'disabled',
                  can: vm.$hasPerm('accounts.change_credentialpolicy'),
                  tip: vm.$hasPerm('accounts.change_credentialpolicy')
                    ? this.$t('Enable')
                    : this.$t('NoPermission'),
                  callback: ({ row }) => vm.performPolicyAction(row, 'enable')
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
    operationHint(status) {
      const keys = {
        rotating: 'CredentialRotatingHint',
        disabling: 'CredentialDisablingHint',
        uncertain: 'CredentialUncertainHint'
      }
      return keys[status] ? this.$t(keys[status]) : ''
    },
    operationTask(row, status) {
      return (
        this.operationTasks[row.id] ||
        ((OPERATION_STATUSES.includes(status) || status === 'uncertain') &&
          (row.operation_task_id || row.last_task_id)) ||
        ''
      )
    },
    renderOperationStatus(row) {
      const status = this.choiceValue(row.status)
      const label = row.status?.label || status || '-'
      const hint =
        status === 'uncertain'
          ? row.last_error || this.operationHint(status)
          : this.operationHint(status)
      return (
        <el-tooltip content={hint} disabled={!hint} placement="top" show-after={300}>
          <el-tag disable-transitions size="small" type={STATUS_TYPES[status] || 'info'}>
            {label}
          </el-tag>
        </el-tooltip>
      )
    },
    policyActionTip(row, title) {
      if (!this.$hasPerm('accounts.change_credentialpolicy')) {
        return this.$t('NoPermission')
      }
      return this.operationHint(this.choiceValue(row.status)) || this.$t(title)
    },
    deletePolicyTip(row) {
      if (!this.$hasPerm('accounts.delete_credentialpolicy')) {
        return this.$t('NoPermission')
      }
      return this.choiceValue(row.status) === 'disabled'
        ? this.$t('Delete')
        : this.$t('DisableBeforeDeleteCredentialPolicy')
    },
    bindingText(row) {
      const binding = this.choiceValue(row.mode) === 'dynamic' ? row.account_template : row.account
      if (!binding) return '-'
      return binding.username ? `${binding.name} (${binding.username})` : binding.name
    },
    lifetimeText(row) {
      if (this.choiceValue(row.mode) === 'static') {
        return this.$t('RotationScheduleValue', {
          value: this.formatSeconds(row.rotation_period)
        })
      }
      return this.$t('LeaseTTLValue', {
        default: this.formatSeconds(row.default_ttl),
        max: this.formatSeconds(row.max_ttl)
      })
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
    async confirmPolicyAction(row, action) {
      const key = action === 'rotate' ? 'RotateCredentialConfirm' : 'DisableCredentialConfirm'
      try {
        await this.$confirm(this.$t(key, { name: row.name }), this.$t('Info'), {
          type: 'warning',
          closeOnPressEscape: true
        })
      } catch {
        return
      }
      await this.performPolicyAction(row, action)
    },
    async performPolicyAction(row, action) {
      const response = await this.$axios.post(`${POLICY_URL}${row.id}/${action}/`)
      this.reloadTable()
      const task = response.task || (action === 'rotate' ? response.execution_id : '')
      if (task) {
        this.$message.success(this.$t('CredentialOperationAccepted'))
        this.startOperationPolling(row.id, task)
      } else {
        this.$message.success(this.$t('CredentialOperationCompleted'))
      }
      if (response.task) openTaskPage(response.task)
    },
    startOperationPolling(id, task) {
      this.operationTasks[id] = task
      clearTimeout(this.operationPollers[id])
      this.operationPollers[id] = setTimeout(() => this.pollOperation(id, 60), 3000)
    },
    async pollOperation(id, attemptsLeft) {
      let policy
      try {
        policy = await this.$axios.get(`${POLICY_URL}${id}/`, {
          disableFlashErrorMsg: true
        })
      } catch {
        delete this.operationPollers[id]
        this.$message.warning(this.$t('CredentialStatusRefreshStopped'))
        return
      }

      this.reloadTable()
      const status = this.choiceValue(policy.status)
      if (!OPERATION_STATUSES.includes(status)) {
        delete this.operationPollers[id]
        delete this.operationTasks[id]
        const failed = status === 'uncertain' || Boolean(policy.last_error)
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
      this.$refs.policyTable?.reloadTable?.()
    }
  }
}
</script>
