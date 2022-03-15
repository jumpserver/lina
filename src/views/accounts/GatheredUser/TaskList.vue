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
        url: '/api/v1/xpack/gathered-user/tasks/',
        permissions: {
          app: 'xpack',
          resource: 'gatherusertask'
        },
        columns: [
          'name', 'nodes', 'is_periodic', 'periodic_display',
          'executed_times', 'actions'
        ],
        columnsShow: {
          min: ['name', 'nodes', 'is_periodic', 'periodic_display', 'executed_times', 'actions']
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
              return cellValue.length
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
          executed_times: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'GatherUserTaskDetail',
              can: vm.$hasPerm('xpack.view_gatherusertaskexecution'),
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
                  can: vm.$hasPerm('xpack.add_gatherusertaskexecution'),
                  callback: function(data) {
                    this.$axios.post(
                      `/api/v1/xpack/gathered-user/task-executions/`,
                      { task: data.row.id }
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
