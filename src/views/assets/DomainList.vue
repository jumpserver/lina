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
        url: '/api/v1/assets/domains/',
        columns: [
          {
            prop: 'name',
            label: this.$t('assets.name'),
            formatter: DetailFormatter,
            sortable: true,
            route: 'DomainDetail'
          },
          {
            prop: 'asset_count',
            label: this.$t('assets.asset')
          },
          {
            prop: 'gateway_count',
            label: this.$t('assets.gateway'),
            formatter: DetailFormatter,
            route: 'GatewayList'
          },
          {
            prop: 'comment',
            label: this.$t('assets.comment'),
            sortable: 'custom'
          },
          {
            prop: 'id',
            label: this.$tc('Action'),
            align: 'center',
            formatter: ActionsFormatter
          }
        ]
      },
      headerActions: {
        hasBulkDelete: false,
        createRoute: 'DomainCreate'
      }
    }
  }
}
</script>

<style>

</style>
