<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import { DetailFormatter } from '@/components/TableFormatters'

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
        columns: [
          'name', 'nodes', 'periodic_display', 'executed_times', 'actions'
        ],
        columnsShow: {
          min: ['name', 'nodes', 'periodic_display', 'executed_times', 'actions']
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
          periodic_display: {
            showOverflowTooltip: true,
            width: 150
          },
          executed_times: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'GatherUserTaskDetail',
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
                  callback: function(data) {
                    this.$axios.post(
                      `/api/v1/xpack/gathered-user/task-executions/`,
                      { task: data.row.id }
                    ).then(res => {
                      window.open(`/#/ops/celery/task/${res.task}/log/`, '_blank', 'toolbar=yes, width=900, height=600')
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
        hasColumnSetting: false
      }
    }
  }
}
</script>

<style>

</style>
