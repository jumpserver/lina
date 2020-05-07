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
          'user_agent': {
            formatter: (row, column, cellValue) => cellValue.slice(0, 20),
            width: '150px'
          },
          'id': {
            type: 'index'
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
