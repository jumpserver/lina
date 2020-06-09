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
          actions: {
            formatterArgs: {
              updateRoute: 'GatherUserTaskUpdate',
              extraActions: [
                {
                  title: vm.$t('xpack.ChangeAuthPlan.Execute'),
                  name: 'execute',
                  type: 'info',
                  callback: function(data) {
                    this.$axios.post(
                      `/api/v1/xpack/gathered-user/task-executions/`,
                      { task: data.row.id }
                    ).then(res => {
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
