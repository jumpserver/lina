<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter, ActionsFormatter } from '@/components/ListTable/formatters/index'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/assets/labels/',
        columns: [
          {
            prop: 'name',
            label: this.$t('assets.name'),
            formatter: DetailFormatter,
            sortable: true,
            route: 'LabelDetail'
          },
          {
            prop: 'value',
            label: this.$t('assets.value'),
            sortable: 'custom'
          },
          {
            prop: 'asset_count',
            label: this.$t('assets.asset')
          },
          {
            prop: 'id',
            label: this.$tc('Action'),
            align: 'center',
            formatter: ActionsFormatter,
            width: '200px'
          }
        ]
      },
      headerActions: {
        hasBulkDelete: false,
        createRoute: 'LabelCreate'
      }
    }
  }
}
</script>

<style>

</style>
