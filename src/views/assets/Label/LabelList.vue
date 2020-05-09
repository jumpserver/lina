<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { ActionsFormatter } from '@/components/ListTable/formatters/index'

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
            sortable: true
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
            label: this.$ttc('action'),
            align: 'center',
            formatter: ActionsFormatter,
            width: '200px',
            actions: {
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/assets/labels/${id}/`
                return this.$axios.delete(url)
              }
            }
          }
        ]
      },
      headerActions: {
        hasBulkDelete: false,
        hasRightActions: false,
        hasExport: false,
        hasImport: false,
        hasRefresh: true,
        hasSearch: true,
        createRoute: 'LabelCreate'
      }
    }
  }
}
</script>

<style>

</style>
