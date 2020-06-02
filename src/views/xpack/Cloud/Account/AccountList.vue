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
        url: '/api/v1/xpack/cloud/accounts/',
        columns: [
          'name', 'get_provider_display', 'get_validity_display', 'date_created', 'comment', 'actions'
        ],
        columnsMeta: {
          name: {
            formatter: null
          }
        }
      },
      headerActions: {
        hasBulkDelete: false,
        hasImport: false,
        createRoute: 'AccountCreate'
      }
    }
  }
}
</script>

<style>

</style>
