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
        url: '/api/v1/assets/labels/',
        excludes: ['category'],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'value', 'asset_count', 'date_created', 'comment', 'org_name', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatter: null
          }
        }
      },
      headerActions: {
        createRoute: 'LabelCreate'
      }
    }
  }
}
</script>

<style>

</style>
