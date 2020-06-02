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
        url: '/api/v1/audits/command-execution-logs/',
        columns: [
          'hosts', 'user', 'command', 'run_as', 'result', 'is_finished',
          'is_success', 'date_start'
        ],
        columnsMeta: {
          is_finished: {
            width: '100px'
          },
          is_success: {
            width: '100px'
          },
          date_start: {
            width: '160px'
          }
        },
        hasSelection: false
      },
      headerActions: {
        hasLeftActions: false,
        hasSelection: false,
        hasCreate: false,
        hasBulkDelete: false,
        hasImport: false,
        hasRefresh: false,
        hasDatePicker: true
      }
    }
  }
}
</script>

<style>

</style>
