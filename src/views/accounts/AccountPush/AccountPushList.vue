<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { DetailFormatter } from '@/components/TableFormatters'
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
        excludes: ['password_rules', 'type'],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'accounts', 'secret_strategy', 'is_periodic', 'periodic_display', 'run_times', 'actions'
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
              console.log('row', row)
              return <span> { row.accounts.join(', ') } </span>
            }
          },
          secret_strategy: {
            formatter: function(row) {
              return <span> { row.secret_strategy.label } </span>
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
          password_strategy_display: {
            label: vm.$t('accounts.AccountChangeSecret.PasswordStrategy'),
            width: '220px',
            showOverflowTooltip: true
          },
          run_times: {
            label: vm.$t('accounts.AccountChangeSecret.ExecutionTimes'),
            width: '87px',
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AccountChangeSecretDetail',
              routeQuery: {
                activeTab: 'ChangeSecretAutomationExecutionList'
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
                  can: this.$hasPerm('accounts.add_pushaccountexecution'),
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
