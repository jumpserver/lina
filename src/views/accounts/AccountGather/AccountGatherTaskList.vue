<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter } from '@/components/TableFormatters'
import { openTaskPage } from '@/utils/jms'

export default {
  components: {
    GenericListPage
  },
  data() {
    const vm = this

    return {
      tableConfig: {
        name: 'TaskListTable',
        url: '/api/v1/assets/gather-account-automations/',
        permissions: {
          app: 'assets',
          resource: 'gatheraccountsautomation'
        },
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'nodes', 'is_periodic', 'periodic_display', 'executed_amount', 'actions']
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
            label: vm.$t('xpack.ChangeAuthPlan.Timer'),
            formatterArgs: {
              showFalse: false
            },
            width: '80px'
          },
          periodic_display: {
            label: vm.$t('xpack.ChangeAuthPlan.TimerPeriod'),
            width: 150
          },
          executed_amount: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AccountGatherTaskDetail',
              can: vm.$hasPerm('accounts.view_gatheraccountsexecution'),
              routeQuery: {
                activeTab: 'TaskExecutionList'
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
                      `/api/v1/assets/gather-account-executions/`,
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
  }
}
</script>

<style>

</style>
