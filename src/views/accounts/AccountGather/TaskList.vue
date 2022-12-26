<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import { DetailFormatter } from '@/components/TableFormatters'
import { openTaskPage } from '@/utils/jms'

export default {
  components: {
    GenericListTable
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
        columns: [
          'name', 'nodes', 'is_periodic', 'periodic_display',
          'executed_amount', 'actions'
        ],
        columnsShow: {
          min: ['name', 'nodes', 'is_periodic', 'periodic_display', 'executed_amount', 'actions']
        },
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'GatherUserTaskDetail',
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
            showOverflowTooltip: true,
            width: 150
          },
          executed_amount: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'GatherUserTaskDetail',
              can: vm.$hasPerm('assets.view_gatheraccountsexecution'),
              routeQuery: {
                activeTab: 'TaskExecutionList'
              }
            }
          },
          actions: {
            formatterArgs: {
              updateRoute: 'GatherUserTaskUpdate',
              hasClone: false,
              extraActions: [
                {
                  title: vm.$t('xpack.Execute'),
                  name: 'execute',
                  type: 'info',
                  can: vm.$hasPerm('assets.add_gatheraccountsexecution'),
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
        hasRefresh: false,
        hasExport: false,
        hasMoreActions: false,
        createRoute: 'GatherUserTaskCreate',
        hasColumnSetting: false,
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
