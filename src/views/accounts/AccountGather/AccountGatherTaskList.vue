<template>
  <GenericListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import { GenericListTable } from '@/layout/components'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'AccountGatherTaskList',
  components: {
    GenericListTable
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        name: 'AccountGatherTaskList',
        url: '/api/v1/accounts/gather-account-automations/',
        permissions: {
          app: 'accounts',
          resource: 'gatheraccountsautomation'
        },
        columns: ['name', 'nodes', 'assets', 'is_periodic', 'periodic_display', 'executed_amount', 'actions'],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'nodes', 'assets', 'is_periodic', 'periodic_display', 'executed_amount', 'actions']
        },
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AccountGatherTaskDetail',
              routeQuery: {
                activeTab: 'Detail'
              }
            }
          },
          nodes: {
            formatter: function(row, column, cellValue, index) {
              return cellValue.map(v => v['name']).join(', ')
            }
          },
          is_periodic: {
            label: vm.$t('accounts.AccountChangeSecret.Timer'),
            formatterArgs: {
              showFalse: false
            },
            width: '152px'
          },
          periodic_display: {
            label: vm.$t('accounts.AccountChangeSecret.TimerPeriod'),
            width: 150
          },
          executed_amount: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AccountGatherList',
              can: vm.$hasPerm('accounts.view_gatheraccountsexecution'),
              getRoute({ row }) {
                return {
                  name: 'AccountGatherList',
                  query: {
                    activeTab: 'AccountGatherTaskExecutionList',
                    automation_id: row.id
                  }
                }
              }
            }
          },
          actions: {
            formatterArgs: {
              updateRoute: 'AccountGatherTaskUpdate',
              hasClone: false,
              extraActions: [
                {
                  title: vm.$t('xpack.Execute'),
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
        createRoute: 'AccountGatherTaskCreate',
        searchConfig: {
          getUrlQuery: false
        }
      }
    }
  },
  watch: {
    $route(to, from) {
      this.$router.go(0)
    }
  }
}
</script>

<style>

</style>
