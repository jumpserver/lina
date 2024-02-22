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
          username: {
            width: '120px'
          },
          backend_display: {
            width: '120px'
          },
          actions: {
            has: false
          },
          city: {
            width: '120px'
          },
          reason_display: {
            width: '120px'
          },
          datetime: {
            width: '120px'
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
