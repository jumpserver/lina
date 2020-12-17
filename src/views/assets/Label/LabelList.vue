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
        columns: ['name', 'value', 'asset_count', 'actions'],
        columnsMeta: {
          name: {
            formatter: null
          },
          asset_count: {
            label: this.$t('assets.Assets')
          }
        }
      },
      headerActions: {
        hasRightActions: false,
        hasExport: false,
        hasImport: false,
        hasRefresh: true,
        hasSearch: true,
        hasMoreActions: false,
        createRoute: 'LabelCreate'
      }
    }
  }
}
</script>

<style>

</style>
