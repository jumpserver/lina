<template>
  <div>
    <GenericListTable ref="ListTable" :header-actions="headerActions" :table-config="tableConfig" />
  </div>
</template>

<script>
import { GenericListTable } from '@/layout/components'
import { ActionsFormatter, DetailFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'AccountChangeSecret',
  components: {
    GenericListTable
  },
  data() {
    const vm = this
    return {
      secretUrl: '',
      showViewSecretDialog: false,
      tableConfig: {
        url: '/api/v1/accounts/change-secret-status/',
        columns: [
          'execution_id', 'asset', 'account', 'status', 'ttl', 'actions'
        ],
        columnsMeta: {
          asset: {
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: true,
              can: this.$hasPerm('assets.view_asset'),
              getTitle: ({ row }) => row.asset.name,
              getDrawerTitle: ({ row }) => row.asset.name,
              getRoute: ({ row }) => ({
                name: 'AssetDetail',
                params: { id: row.asset.id },
                query: { tab: 'Basic' }
              })
            }
          },
          account: {
            label: vm.$t('Username'),
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: true,
              can: this.$hasPerm('accounts.view_account'),
              getTitle: ({ row }) => row.username,
              getDrawerTitle: ({ row }) => row.username,
              getRoute: ({ row }) => ({
                name: 'AssetAccountDetail',
                params: { id: row.id },
                query: { tab: 'Basic' }
              })
            }
          },
          ttl: {
            label: vm.$t('TTL')
          },
          execution_id: {
            width: '200px',
            label: vm.$t('ExecutionID'),
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: true,
              can: true,
              getTitle: ({ row }) => row.meta?.execution_id ? row.meta.execution_id : '-',
              getDrawerTitle: ({ row }) => row.meta?.execution_id,
              getRoute: ({ row }) => ({
                name: 'AccountChangeSecretExecutionDetail',
                params: { id: row.meta?.execution_id }
              })
            }
          },
          status: {
            width: '100px',
            label: vm.$t('Status'),
            formatter: (row) => {
              const statusMap = {
                queued: 'Queued',
                ready: 'Ready',
                processing: 'Processing'
              }

              if (statusMap[row.meta.status]) {
                return <span>{ vm.$t(statusMap[row.meta.status]) }</span>
              }
              return <span>–</span>
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
                  name: 'Delete',
                  title: this.$t('Delete'),
                  can: this.$hasPerm('accounts.add_changesecretexecution'),
                  type: 'danger',
                  callback: ({ row }) => {
                    this.$axios.delete(
                      '/api/v1/accounts/change-secret-status/',
                      {
                        data: {
                          account_ids: [row.id]
                        }
                      }
                    )
                    vm.$refs.ListTable.reloadTable()
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
          getUrlQuery: true,
          options: [
            {
              label: this.$t('AssetID'),
              value: 'asset_id'
            },
            {
              label: this.$t('AssetName'),
              value: 'asset_name'
            },
            {
              label: this.$t('AccountID'),
              value: 'id'
            },
            {
              label: this.$t('Username'),
              value: 'username'
            },
            {
              label: this.$t('ExecutionID'),
              value: 'execution_id'
            },
            {
              value: 'status',
              label: this.$t('Status'),
              type: 'choice',
              children: [
                {
                  default: true,
                  value: 'queued',
                  label: this.$t('Queued')
                },
                {
                  value: 'ready',
                  label: this.$t('Ready')
                },
                {
                  value: 'processing',
                  label: this.$t('Processing')
                }
              ]
            }
          ]
        },
        extraMoreActions: [
          {
            name: 'DeleteSelected',
            title: this.$t('DeleteSelected'),
            type: 'primary',
            fa: 'fa-retweet',
            can: ({ selectedRows }) => {
              return selectedRows.length > 0
            },
            callback: function({ selectedRows }) {
              const ids = selectedRows.map(v => {
                return v.id
              })
              this.$axios.delete(
                '/api/v1/accounts/change-secret-status/',
                {
                  data: {
                    account_ids: ids
                  }
                }
              )
              vm.$refs.ListTable.reloadTable()
            }.bind(this)
          }
        ]
      }
    }
  }
}
</script>
