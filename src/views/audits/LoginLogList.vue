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
        url: '/api/v1/audits/login-logs/',
        columns: ['username', 'type', 'ip', 'city', 'user_agent', 'mfa', 'reason', 'status', 'datetime'],
        columnsMeta: {
          user_agent: {
            width: '150px',
            showOverflowTooltip: true
          },
          ip: {
            width: '140px'
          },
          status: {
            width: '80px'
          },
          mfa: {
            label: 'MFA',
            width: '80px'
          },
          type: {
            width: '100px'
          },
          datetime: {
            width: '160px'
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasImport: false,
        hasRefresh: false
      }
    }
  }
}
</script>

<style>

</style>
