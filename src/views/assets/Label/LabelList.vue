<template>
  <GenericListPage :header-actions="headerActions" :table-config="tableConfig" />
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
        columnsExclude: ['category'],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'value', 'asset_count', 'date_created',
            'comment', 'org_name', 'actions'
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
