<template>
  <GenericListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import { ActionsFormatter, DetailFormatter } from '@/components/Table/TableFormatters'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'AccountPushExecutionTaskList',
  components: {
    GenericListTable
  },
  props: {
    object: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/accounts/push-account-records/?execution_id=${this.object.id}`,
        columns: [
          'asset', 'account', 'date_finished', 'is_success', 'error', 'actions'
        ],
        columnsMeta: {
          asset: {
            label: this.$t('accounts.AccountChangeSecret.Asset'),
            formatter: DetailFormatter,
            formatterArgs: {
              can: this.$hasPerm('assets.view_asset'),
              getTitle({ row }) {
                return row.asset.name
              },
              getRoute({ row }) {
                return {
                  name: 'AssetDetail',
                  params: { id: row.asset.id }
                }
              }
            }
          },
          account: {
            label: this.$t('users.Username'),
            formatter: DetailFormatter,
            formatterArgs: {
              can: this.$hasPerm('accounts.view_account'),
              getTitle({ row }) {
                return row.account.name
              },
              getRoute({ row }) {
                return {
                  name: 'AssetAccountDetail',
                  params: { id: row.account.id }
                }
              }
            }
          },
          is_success: {
            label: this.$t('accounts.AccountChangeSecret.Success'),
            formatter: (row) => {
              if (row.status === 'pending') {
                return <i Class='fa  fa fa-spinner fa-spin'/>
              }
              if (row.is_success) {
                return <i Class='fa fa-check text-primary'/>
              }
              return <i Class='fa fa-times text-danger'/>
            }
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: false,
              hasDelete: false,
              hasClone: false,
              moreActionsTitle: this.$t('common.More'),
              extraActions: [
                {
                  name: 'Retry',
                  title: this.$t('accounts.AccountChangeSecret.Retry'),
                  can: this.$hasPerm('accounts.add_changesecretexecution'),
                  type: 'primary',
                  callback: ({ row }) => {
                    this.$axios.post(
                      '/api/v1/accounts/push-account-records/execute/',
                      { record_id: row.id }
                    ).then(res => {
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
        hasBulkUpdate: false
      }
    }
  }
}
</script>

<style scoped>

</style>
