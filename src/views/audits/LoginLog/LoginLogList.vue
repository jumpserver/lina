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
        columnsExclude: ['backend'],
        columnsShow: {
          min: ['username', 'type'],
          default: [
            'username', 'type', 'backend_display', 'ip', 'city',
            'user_agent', 'mfa', 'reason_display', 'status', 'datetime'
          ]
        },
        url: '/api/v1/audits/login-logs/',
        columnsMeta: {
          user_agent: {
            width: '150px'
          },
          actions: {
            has: false
          },
          ip: {
            width: '140px'
          },
          city: {
            width: '90px'
          },
          mfa: {
            width: '80px'
          },
          type: {
            width: '110px'
          },
          datetime: {
            width: '160px'
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
