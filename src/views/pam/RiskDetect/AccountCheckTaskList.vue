<template>
  <GenericListTable ref="listTable" :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import { DetailFormatter } from '@/components/Table/TableFormatters'
import { openTaskPage } from '@/utils/jms'
import { GenericListTable } from '@/layout/components'
import AmountFormatter from '@/components/Table/TableFormatters/AmountFormatter.vue'

export default {
  name: 'AccountPushList',
  components: {
    GenericListTable
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/accounts/check-account-automations/',
        columns: [
          'name', 'assets', 'nodes', 'is_periodic',
          'periodic_display', 'is_active', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'assets', 'nodes', 'periodic_display',
            'executed_amount', 'is_active', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AccountCheckDetail'
            }
          },
          assets: {
            formatter: AmountFormatter,
            formatterArgs: {
              async: false,
              getRoute({ row }) {
                return {
                  name: 'AssetDetail',
                  params: {
                    id: row.id
                  }
                }
              }
            }
          },
          nodes: {
            formatter: AmountFormatter,
            formatterArgs: {
              async: false,
              getRoute({ row }) {
                return {
                  name: 'AssetDetail',
                  params: {
                    id: row.id
                  }
                }
              }
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
                return this.$t('DynamicUsername')
              } else {
                return username
              }
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
            formatterArgs: {
              canUpdate: () => true,
              updateRoute: 'AccountCheckCreateUpdate',
              extraActions: [
                {
                  title: vm.$t('Execute'),
                  order: 1,
                  type: 'primary',
                  name: 'execute',
                  can: ({ row }) => {
                    return row.is_active && vm.$hasPerm('accounts.add_accountcheckautomation')
                  },
                  callback: function({ row }) {
                    this.$axios.post(
                      `/api/v1/accounts/check-account-executions/`,
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
        createRoute: 'AccountCheckCreateUpdate',
        canCreate: vm.$hasPerm('accounts.add_accountcheckautomation')
      }
    }
  }
}
</script>
