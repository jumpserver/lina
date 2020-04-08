<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter, ActionsFormatter, BooleanFormatter } from '@/components/ListTable/formatters/index'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/assets/assets/',
        columns: [
          {
            prop: 'hostname',
            label: this.$t('assets.hostname'),
            formatter: DetailFormatter,
            sortable: true,
            route: 'AssetDetail'
          },
          {
            prop: 'ip',
            label: this.$t('assets.ip'),
            sortable: 'custom'
          },
          {
            prop: 'hardware_info',
            label: this.$t('assets.hardware')
          },
          {
            prop: 'reachable',
            label: this.$t('assets.reachable'),
            formatter: BooleanFormatter
          },
          {
            prop: 'id',
            label: this.$tc('Action'),
            align: 'center',
            formatter: ActionsFormatter,
            width: '200px',
            actions: {
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/assets/assets/${id}/`
                return this.$axios.delete(url)
              }
            }
          }
        ]
      },
      headerActions: {
        createRoute: 'AssetCreate'
      }
    }
  }
}
</script>

<style>

</style>
