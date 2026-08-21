<template>
  <GenericListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script lang="jsx">
import { GenericListTable } from '@/layout/components'
import { ActionsFormatter, DetailFormatter } from '@/components/Table/TableFormatters'
import { openTaskPage } from '@/utils/jms/index'
export default {
  name: 'AccountPushRecord',
  components: {
    GenericListTable
  },
  props: {
    object: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/accounts/push-account-records/',
        columns: ['asset', 'account', 'date_finished', 'is_success', 'error', 'actions'],
        columnsMeta: {
          asset: {
            label: this.$t('Asset'),
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: true,
              can: this.$hasPerm('assets.view_asset'),
              getTitle({ row }) {
                return row.asset.name
              },
              getDrawerTitle({ row }) {
                return row.asset.name
              },
              getRoute({ row }) {
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
              getTitle({ row }) {
                return row.account.username
              },
              getDrawerTitle({ row }) {
                return row.account.username
              },
              getRoute({ row }) {
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
                return <i class="fa  fa fa-spinner fa-spin" />
              }
              if (row.is_success) {
                return <i class="fa fa-check text-primary" />
              }
              return <i class="fa fa-times text-danger" />
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
                  name: 'Test',
                  title: this.$t('Test'),
                  icon: 'fa-circle-play',
                  tip: this.$t('PushAccountRecordTestTip'),
                  can: () =>
                    !this.$store.getters.currentOrgIsRoot &&
                    this.$hasPerm('accounts.verify_account'),
                  type: 'primary',
                  callback: ({ row }) => vm.executeAccounts('verify', [row.account.id])
                },
                {
                  name: 'Push',
                  title: this.$t('Push'),
                  icon: 'fa-solid fa-upload',
                  tip: this.$t('PushAccountRecordPushTip'),
                  can: () =>
                    !this.$store.getters.currentOrgIsRoot && this.$hasPerm('accounts.push_account'),
                  type: 'primary',
                  callback: ({ row }) => vm.executeAccounts('push', [row.account.id])
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
            tip: this.$t('PushAccountRecordsTestTip'),
            showHelp: true,
            can: ({ selectedRows }) =>
              selectedRows.length > 0 &&
              !vm.$store.getters.currentOrgIsRoot &&
              vm.$hasPerm('accounts.verify_account'),
            callback: ({ selectedRows }) => {
              vm.executeAccounts(
                'verify',
                selectedRows.map((row) => row.account.id)
              )
            }
          },
          {
            name: 'PushSelected',
            title: this.$t('Push'),
            type: 'primary',
            icon: 'fa-solid fa-upload',
            tip: this.$t('PushAccountRecordsPushTip'),
            showHelp: true,
            can: ({ selectedRows }) =>
              selectedRows.length > 0 &&
              !vm.$store.getters.currentOrgIsRoot &&
              vm.$hasPerm('accounts.push_account'),
            callback: ({ selectedRows }) => {
              vm.executeAccounts(
                'push',
                selectedRows.map((row) => row.account.id)
              )
            }
          }
        ]
      }
    }
  },
  methods: {
    executeAccounts(action, accountIds) {
      const ids = [...new Set(accountIds)]
      this.$axios
        .post('/api/v1/accounts/accounts/tasks/', {
          action,
          accounts: ids
        })
        .then((res) => openTaskPage(res.task))
    }
  }
}
</script>
