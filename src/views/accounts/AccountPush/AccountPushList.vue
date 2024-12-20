<template>
  <GenericListTable ref="listTable" :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import { ActionsFormatter, DetailFormatter } from '@/components/Table/TableFormatters'
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
            'name', 'accounts', 'periodic_display',
            'executed_amount', 'is_active', 'actions'
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
          assets_amount: {
            label: vm.$t('AssetsOfNumber')
          },
          nodes_amount: {
            label: vm.$t('NodeOfNumber')
          },
          password_strategy_display: {
            label: vm.$t('PasswordStrategy'),
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
                    tab: 'AccountPushExecutionList',
                    automation_id: row.id
                  }
                }
              }
            }
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              onClone: ({ row }) => {
                vm.$router.push({ name: 'AccountPushCreate', query: { clone_from: row.id }})
              },
              onUpdate: ({ row }) => {
                vm.$router.push({ name: 'AccountPushUpdate', params: { id: row.id }})
              },
              extraActions: [
                {
                  title: vm.$t('Execute'),
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
        hasImport: false,
        createRoute: () => {
          return {
            name: 'AccountPushCreate'
          }
        }
      }
    }
  }
}
</script>
