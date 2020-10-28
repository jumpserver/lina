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
        url: '/api/v1/applications/applications/?category=cloud',
        columns: [
          'name', 'type', 'attrs.cluster', 'comment', 'actions'
        ],
        columnsMeta: {
          'attrs.cluster': {
            label: this.$t('applications.cluster')
          },
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
