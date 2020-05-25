<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/orgs/orgs/',
        columns: ['name', 'comment', 'actions']
      },
      headerActions: {
        hasRightActions: false,
        hasBulkDelete: false
      }
    }
  }
}
</script>

<style scoped>

</style>
