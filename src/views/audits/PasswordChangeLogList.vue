<template>
  <GenericListPage :header-actions="headerActions" :table-config="tableConfig" />
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
        columnsShow: {
          min: ['user', 'change_by'],
          default: ['user', 'change_by', 'remote_addr', 'datetime']
        },
        columnsMeta: {
          actions: {
            has: false
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasImport: false,
        hasReportExport: true,
        hasDatePicker: true,
        searchConfig: {
          getUrlQuery: true
        }
      }
    }
  }
}
</script>

<style></style>
