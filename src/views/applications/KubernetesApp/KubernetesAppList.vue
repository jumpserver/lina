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
        url: '/api/v1/applications/k8s-apps/',
        columns: [
          'name', 'cluster', 'comment', 'actions'
        ],
        columnsMeta: {
          comment: {
            width: '340px'
          }
        }
      },
      headerActions: {
        hasBulkDelete: false,
        createRoute: 'KubernetesAppCreate'
      }
    }
  }
}
</script>

<style>

</style>
