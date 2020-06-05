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
              updateRoute: 'GatherUserTaskUpdate'
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
