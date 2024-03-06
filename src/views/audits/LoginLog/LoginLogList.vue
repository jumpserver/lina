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
        permissions: {
          app: 'audits',
          resource: 'userloginlog'
        },
        columnsShow: {
          min: ['username', 'status'],
          default: [
            'username', 'backend_display', 'city',
            'reason_display', 'status', 'datetime'
          ]
        },
        url: '/api/v1/audits/login-logs/',
        columnsMeta: {
          actions: {
            has: false
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasImport: false,
        hasDatePicker: true,
        searchConfig: {
          getUrlQuery: true
        }
      }
    }
  }
}
</script>

<style>

</style>
