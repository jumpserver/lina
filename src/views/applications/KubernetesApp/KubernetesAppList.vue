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
          'name', 'type', 'cluster', 'comment', 'actions'
        ],
        columnsMeta: {
          comment: {
            width: '340px'
          },
          type: {
            width: '140px'
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
