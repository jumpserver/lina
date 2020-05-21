<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListPage from '@/layout/components/GenericListPage'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/xpack/gathered-user/tasks/',
        columns: [
          'name', 'nodes', 'periodic_display', 'executed_times', 'actions'
        ],
        columnsMeta: {}
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
