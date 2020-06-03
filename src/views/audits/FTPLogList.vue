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
          user: {
            showOverflowTooltip: true
          },
          system_user: {
            showOverflowTooltip: true
          },
          remote_addr: {
            width: '140px'
          },
          filename: {
            showOverflowTooltip: true
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
