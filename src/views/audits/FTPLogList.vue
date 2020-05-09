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
        url: '/api/v1/audits/ftp-logs/',
        columns: [
          'user', 'asset', 'system_user', 'remote_addr', 'operate',
          'filename', 'is_success', 'date_start'
        ],
        columnsMeta: {
        },
        hasSelection: false
      }
    }
  }
}
</script>

<style>

</style>
