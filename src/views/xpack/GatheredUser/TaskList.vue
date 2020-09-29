<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import ListTable from '@/components/ListTable'

export default {
  components: {
    ListTable
  },
  data() {
    const vm = this

    return {
      tableConfig: {
        url: '/api/v1/xpack/gathered-user/tasks/',
        columns: [
          'name', 'nodes', 'periodic_display', 'executed_times', 'actions'
        ],
        columnsMeta: {
          name: {
            formatter: null
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
          actions: {
            formatterArgs: {
              updateRoute: 'GatherUserTaskUpdate',
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
        createRoute: 'GatherUserTaskCreate'
      }
    }
  }
}
</script>

<style>

</style>
