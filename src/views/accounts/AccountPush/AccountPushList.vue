<template>
  <GenericListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import { DetailFormatter } from '@/components/Table/TableFormatters'
import { openTaskPage } from '@/utils/jms'
import { GenericListTable } from '@/layout/components'

export default {
  name: 'AccountPushList',
  components: {
    GenericListTable
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/accounts/push-account-automations/',
        columns: [
          'name', 'accounts', 'secret_strategy', 'is_periodic',
          'periodic_display', 'executed_amount', 'is_active', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'accounts', 'secret_strategy', 'is_periodic',
            'periodic_display', 'executed_amount', 'is_active', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AccountPushDetail'
            }
          },
          accounts: {
            formatter: function(row) {
              return <span> {row.accounts.join(', ')} </span>
            }
          },
          secret_strategy: {
            formatter: function(row) {
              return <span> {row.secret_strategy.label} </span>
            }
          },
          username: {
            showOverflowTooltip: true,
            formatter: ({ username }) => {
              if (username === '@USER') {
                return this.$t('accounts.DynamicUsername')
              } else {
                return username
              }
            }
          },
          assets_amount: {
            label: vm.$t('accounts.AccountChangeSecret.AssetAmount'),
            width: '80px'
          },
          nodes_amount: {
            label: vm.$t('accounts.AccountChangeSecret.NodeAmount'),
            width: '80px'
          },
          is_periodic: {
            width: '152px'
          },
          periodic_display: {
            label: vm.$t('accounts.AccountChangeSecret.TimerPeriod'),
            width: '150px'
          },
          password_strategy_display: {
            label: vm.$t('accounts.AccountChangeSecret.PasswordStrategy'),
            width: '220px',
            showOverflowTooltip: true
          },
          executed_amount: {
            formatter: DetailFormatter,
            formatterArgs: {
              can: vm.$hasPerm('accounts.view_pushaccountexecution'),
              getRoute({ row }) {
                return {
                  name: 'AccountPushList',
                  query: {
                    activeTab: 'AccountPushExecutionList',
                    automation_id: row.id
                  }
                }
              }
            }
          },
          is_active: {
            width: '87px'
          },
          comment: {
            width: '90px'
          },
          actions: {
            width: '164px',
            formatterArgs: {
              extraActions: [
                {
                  title: vm.$t('xpack.Execute'),
                  name: 'execute',
                  can: ({ row }) => {
                    return row.is_active && vm.$hasPerm('accounts.add_pushaccountexecution')
                  },
                  type: 'info',
                  callback: function({ row }) {
                    this.$axios.post(
                      `/api/v1/accounts/push-account-executions/`,
                      {
                        automation: row.id,
                        type: row.type.value
                      }
                    ).then(res => {
                      openTaskPage(res['task'])
                    })
                  }.bind(this)
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasRefresh: true,
        hasExport: false,
        hasImport: false
      }
    }
  }
}
</script>

<style scoped>

</style>
