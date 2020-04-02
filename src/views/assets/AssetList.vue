<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import DetailFormatter from '@/components/DataTable/formatters/DetailFormatter'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      showTree: true,
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
            label: this.$t('assets.ip')
          },
          {
            prop: 'hardware_info',
            label: this.$t('assets.hardware')
          },
          {
            prop: 'reachable',
            label: this.$t('assets.reachable')
          }
        ],
        tableActions: {
          hasEdit: true,
          editRoute: '404'
        }
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
