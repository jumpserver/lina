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
        columns: [
          'name', 'value', 'asset_count',
          'date_created', 'comment', 'org_name', 'actions'
        ],
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
        hasMoreActions: false,
        createRoute: 'LabelCreate'
      }
    }
  }
}
</script>

<style>

</style>
