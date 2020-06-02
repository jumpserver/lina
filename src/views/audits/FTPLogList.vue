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
          remote_addr: {
            width: '130px'
          },
          operate: {
            width: '90px'
          },
          is_success: {
            width: '80px'
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
