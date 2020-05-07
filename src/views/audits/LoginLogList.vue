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
        columns: ['id', 'username', 'type', 'ip', 'city', 'user_agent', 'mfa', 'reason', 'status', 'datetime'],
        columnsMeta: {
          id: {
            type: 'index',
            index: (v) => v * 2
          }
        },
        hasSelection: false
      },
      headerActions: {
        createRoute: 'AssetCreate'
      }
    }
  }
}
</script>

<style>

</style>
