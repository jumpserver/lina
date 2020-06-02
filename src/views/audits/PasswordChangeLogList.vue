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
            width: '180px'
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasDatePicker: true,
        hasImport: false
      }
    }
  }
}
</script>

<style>

</style>
