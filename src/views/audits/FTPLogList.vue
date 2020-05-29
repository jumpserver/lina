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
        url: '/api/v1/audits/ftp-logs/',
        columns: [
          'user', 'asset', 'system_user', 'remote_addr', 'operate',
          'filename', 'is_success', 'date_start'
        ],
        columnsMeta: {
        },
        hasSelection: false
      },
      headerActions: {
        hasSelection: false,
        hasCreate: false,
        hasBulkDelete: false,
        hasImport: false,
        hasRefresh: false
      }
    }
  }
}
</script>

<style>

</style>
