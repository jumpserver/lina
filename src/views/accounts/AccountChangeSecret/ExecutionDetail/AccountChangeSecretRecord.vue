<template>
  <div>
    <RecordViewSecret
      v-if="showViewSecretDialog"
      v-model:visible="showViewSecretDialog"
      :url="secretUrl"
    />
    <GenericListTable ref="ListTable" :header-actions="headerActions" :table-config="tableConfig" />
  </div>
</template>

<script lang="jsx">
import { GenericListTable } from '@/layout/components'
import { ActionsFormatter, DetailFormatter } from '@/components/Table/TableFormatters'
import { openTaskPage } from '@/utils/jms/index'
import RecordViewSecret from '@/components/Apps/ChangeSecret/RecordViewSecret.vue'
import { ElMessageBox } from 'element-plus'
export default {
  name: 'AccountChangeSecretRecord',
  components: {
    RecordViewSecret,
    GenericListTable
  },
  data() {
    const vm = this
    return {
      secretUrl: '',
      showViewSecretDialog: false,
      tableConfig: {
        url: '/api/v1/accounts/change-secret-records/',
        columns: [
          'asset',
          'account',
          'date_finished',
          'is_success',
          'verification_status',
          'error',
          'actions'
        ],
        columnsMeta: {
          asset: {
            label: this.$t('Asset'),
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: true,
              can: this.$hasPerm('assets.view_asset'),
              getTitle: ({ row }) => row.asset.name,
              getDrawerTitle: ({ row }) => row.asset.name,
              getRoute: ({ row }) => {
                return {
                  name: 'AssetDetail',
                  params: {
                    id: row.asset.id
                  }
                }
              }
            }
          },
          account: {
            label: this.$t('Username'),
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: true,
              can: this.$hasPerm('accounts.view_account'),
              getTitle: ({ row }) => row.account.username,
              getDrawerTitle: ({ row }) => row.account.username,
              getRoute: ({ row }) => {
                return {
                  name: 'AssetAccountDetail',
                  params: {
                    id: row.account.id
                  }
                }
              }
            }
          },
          is_success: {
            label: this.$t('Success'),
            formatter: (row) => {
              if (row.status === 'pending') {
                return <i class="fa fa-spinner fa-spin" />
              }
              if (row.is_success) {
                return <i class="fa fa-check-circle text-primary" />
              }
              return <i class="fa fa-times-circle text-danger" />
            }
          },
          verification_status: {
            label: this.$t('Test'),
            formatter: (row) => {
              if (row.verification_status === 'pending') {
                return <i class="fa fa-spinner fa-spin" />
              }
              if (row.verification_status === 'success') {
                return <i class="fa fa-check-circle text-primary" />
              }
              if (row.verification_status === 'failed') {
                return <i class="fa fa-times-circle text-danger" title={row.verification_error} />
              }
              if (row.verification_status === 'unverified') {
                return <i class="fa fa-exclamation-triangle text-warning" />
              }
              return '-'
            }
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: false,
              hasDelete: false,
              hasClone: false,
              moreActionsTitle: this.$t('More'),
              extraActions: [
                {
                  name: 'View',
                  title: this.$t('View'),
                  type: 'primary',
                  callback: ({ row }) => {
                    // debugger
                    vm.secretUrl = `/api/v1/accounts/change-secret-records/${row.id}/secret/`
                    vm.showViewSecretDialog = false
                    setTimeout(() => {
                      vm.showViewSecretDialog = true
                    })
                  }
                },
                {
                  name: 'Test',
                  title: this.$t('Test'),
                  icon: 'fa-circle-play',
                  tip: this.$t('ChangeSecretRecordTestTip'),
                  can: () =>
                    !this.$store.getters.currentOrgIsRoot &&
                    this.$hasPerm('accounts.verify_account'),
                  type: 'primary',
                  callback: ({ row }) => vm.verifyRecords([row.id])
                },
                {
                  name: 'Restore',
                  title: this.$t('Resume'),
                  icon: 'fa-solid fa-database',
                  tip: this.$t('ChangeSecretRecordRestoreTip'),
                  can: ({ row }) =>
                    row.verification_status !== 'pending' &&
                    !this.$store.getters.currentOrgIsRoot &&
                    this.$hasPerm('accounts.change_account'),
                  type: 'primary',
                  callback: ({ row }) => vm.restoreRecords([row])
                },
                {
                  name: 'Retry',
                  title: this.$t('Retry'),
                  icon: 'fa-solid fa-rotate',
                  tip: this.$t('ChangeSecretRecordRetryTip'),
                  can: this.$hasPerm('accounts.add_changesecretexecution'),
                  type: 'primary',
                  callback: ({ row }) => {
                    this.$axios
                      .post('/api/v1/accounts/change-secret-records/execute/', {
                        record_ids: [row.id]
                      })
                      .then((res) => {
                        openTaskPage(res['task'])
                      })
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasSearch: true,
        hasRefresh: true,
        hasLeftActions: true,
        hasRightActions: true,
        hasExport: false,
        hasImport: false,
        hasCreate: false,
        hasBulkDelete: false,
        hasBulkUpdate: false,
        searchConfig: {
          getUrlQuery: true
        },
        extraMoreActions: [
          {
            name: 'TestSelected',
            title: this.$t('TestSelected'),
            type: 'primary',
            icon: 'fa-circle-play',
            tip: this.$t('ChangeSecretRecordsTestTip'),
            showHelp: true,
            can: ({ selectedRows }) =>
              selectedRows.length > 0 &&
              !vm.$store.getters.currentOrgIsRoot &&
              vm.$hasPerm('accounts.verify_account'),
            callback: ({ selectedRows }) => {
              vm.verifyRecords(selectedRows.map((row) => row.id))
            }
          },
          {
            name: 'RestoreSelected',
            title: this.$t('RestoreSelected'),
            type: 'primary',
            icon: 'fa-solid fa-database',
            tip: this.$t('ChangeSecretRecordsRestoreTip'),
            showHelp: true,
            can: ({ selectedRows }) =>
              selectedRows.length > 0 &&
              selectedRows.every((row) => row.verification_status !== 'pending') &&
              !vm.$store.getters.currentOrgIsRoot &&
              vm.$hasPerm('accounts.change_account'),
            callback: ({ selectedRows }) => {
              vm.restoreRecords(selectedRows)
            }
          },
          {
            name: 'RetrySelected',
            title: this.$t('RetrySelected'),
            type: 'primary',
            icon: 'fa-solid fa-rotate',
            tip: this.$t('ChangeSecretRecordsRetryTip'),
            showHelp: true,
            can: ({ selectedRows }) => {
              return selectedRows.length > 0 && vm.$hasPerm('accounts.add_changesecretexecution')
            },
            callback: function ({ selectedRows }) {
              const ids = selectedRows.map((v) => {
                return v.id
              })
              this.$axios
                .post('/api/v1/accounts/change-secret-records/execute/', {
                  record_ids: ids
                })
                .then((res) => {
                  openTaskPage(res['task'])
                })
            }.bind(this)
          }
        ]
      }
    }
  },
  methods: {
    verifyRecords(recordIds) {
      this.$axios
        .post('/api/v1/accounts/change-secret-records/verify/', {
          record_ids: recordIds
        })
        .then((res) => openTaskPage(res.task))
    },
    restoreRecords(records) {
      const force = records.some((row) => row.verification_status !== 'success')
      const message = force
        ? this.$t('ForceRestoreChangeSecretRecordsConfirm')
        : this.$t('ConfirmExecuteOperation')

      ElMessageBox.confirm(message, this.$t('OperationConfirm'), {
        type: 'warning',
        confirmButtonText: this.$t('Confirm'),
        cancelButtonText: this.$t('Cancel')
      })
        .then(() =>
          this.$axios.post('/api/v1/accounts/change-secret-records/restore/', {
            record_ids: records.map((row) => row.id),
            force
          })
        )
        .then((res) => {
          const changed = res.restored + res.already_synced
          const skipped = res.not_verified + res.conflicts.length
          if (changed > 0) {
            this.$message.success(`${this.$t('UpdateSuccessMsg')} (${changed})`)
          }
          if (skipped > 0) {
            this.$message.warning(`${this.$t('Failed')}: ${skipped}`)
          }
          this.$refs.ListTable.reloadTable()
        })
        .catch(() => {})
    }
  }
}
</script>
