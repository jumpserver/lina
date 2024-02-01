<template>
  <GenericListPage :header-actions="headerActions" :help-message="notice" :table-config="tableConfig" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter } from '@/components/Table/TableFormatters'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/assets/domains/',
        columnsExclude: ['gateway'],
        columnsExtra: ['gateway_count'],
        columns: ['name', 'assets_amount', 'gateways', 'comment', 'actions'],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'assets_amount', 'gateways', 'comment', 'actions']
        },
        columnsMeta: {
          assets_amount: {
            width: '160px',
            formatter: DetailFormatter
          },
          gateways: {
            formatter: DetailFormatter,
            formatterArgs: {
              permissions: 'assets.view_gateway',
              routeQuery: {
                activeTab: 'GatewayList'
              },
              getTitle: function({ row }) {
                return row.gateways.length
              }
            }
          }
        }
      },
      headerActions: {
        hasLabelSearch: true,
        createRoute: 'DomainCreate'
      },
      notice: this.$t('DomainHelpMessage')
    }
  }
}
</script>

<style>

</style>
