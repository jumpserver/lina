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
        url: '/api/v1/audits/password-change-logs/',
        columns: ['user', 'change_by', 'remote_addr', 'datetime'],
        columnsMeta: {
          datetime: {
            width: '160px'
          },
          remote_addr: {
            width: '140px'
          }
        },
        hasSelection: false
      },
      headerActions: {
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
