<template>
  <GenericListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import { GenericListTable } from '@/layout/components'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'AccountDiscoverTaskList',
  components: {
    GenericListTable
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        name: 'AccountDiscoverTaskList',
        url: '/api/v1/accounts/gather-account-automations/',
        permissions: {
          app: 'accounts',
          resource: 'gatheraccountsautomation'
        },
        columns: [
          'name', 'nodes', 'assets', 'is_periodic',
          'periodic_display', 'executed_amount'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'nodes', 'assets', 'is_periodic',
            'periodic_display', 'executed_amount'
          ]
        },
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AccountDiscoverTaskDetail',
              routeQuery: {
                tab: 'AccountDiscoverTaskDetail'
              }
            }
          },
          nodes: {
            formatter: function(row, column, cellValue, index) {
              return cellValue.map(v => v['name']).join(', ')
            }
          },
          is_periodic: {
            formatterArgs: {
              showFalse: false
            },
            width: '150px'
          },
          periodic_display: {},
          executed_amount: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AccountDiscoverList',
              can: vm.$hasPerm('accounts.view_gatheraccountsexecution'),
              getRoute({ row }) {
                return {
                  name: 'AccountDiscoverList',
                  query: {
                    tab: 'AccountDiscoverTaskExecutionList',
                    automation_id: row.id
                  }
                }
              }
            }
          },
          actions: {
            formatterArgs: {
              updateRoute: 'AccountDiscoverTaskUpdate',
              hasClone: false,
              extraActions: [
                {
                  title: vm.$t('Execute'),
                  name: 'execute',
                  type: 'info',
                  can: vm.$hasPerm('accounts.add_gatheraccountsexecution'),
                  callback: function(data) {
                    this.$axios.post(
                      `/api/v1/accounts/gather-account-executions/`,
                      {
                        automation: data.row.id,
                        type: data.row.type.value
                      }
                    ).then(res => {
                      openTaskPage(res['task'])
                    }).catch(res => {
                    })
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasBulkDelete: false,
        hasImport: false,
        hasExport: false,
        hasMoreActions: false,
        createRoute: 'AccountDiscoverTaskCreate',
        searchConfig: {
          getUrlQuery: false
        }
      }
    }
  },
  watch: {
    // $route(to, from) {
    // this.$router.go(0)
    // }
  }
}
</script>
