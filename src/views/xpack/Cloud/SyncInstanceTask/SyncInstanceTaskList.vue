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
        url: '/api/v1/xpack/cloud/sync-instance-tasks/',
        columns: [
          'name', 'account_name', 'history_count', 'instance_count', 'periodic_display',
          'date_last_sync', 'comment', 'actions'
        ],
        columnsMeta: {}
      },
      headerActions: {
        hasBulkDelete: false,
        hasImport: false,
        hasRefresh: false,
        hasExport: false,
        createRoute: 'SyncInstanceTaskCreate'
      }
    }
  }
}
</script>

<style>

</style>
