<template>
  <GenericListPage :table-config="tableConfig" />
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
            type: 'index'
          },
          user_agent: {
            formatter: (row, column, cellValue) => cellValue.slice(0, 20),
            width: '150px'
          }
        },
        hasSelection: false
      }
    }
  }
}
</script>

<style>

</style>
