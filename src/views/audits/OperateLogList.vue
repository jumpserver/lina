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
        url: '/api/v1/audits/operate-logs/',
        columns: ['user', 'action', 'resource_type', 'resource', 'remote_addr', 'datetime'],
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
