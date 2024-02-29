<template>
  <GenericListPage :header-actions="headerActions" :help-message="notice" :table-config="tableConfig" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import AmountFormatter from '@/components/Table/TableFormatters/AmountFormatter.vue'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/assets/domains/',
        columnsExclude: ['gateway'],
        columnsExtra: ['gateways'],
        columns: ['name', 'assets_amount', 'gateways', 'comment', 'actions'],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'assets_amount', 'gateways', 'comment', 'actions']
        },
        columnsMeta: {
          assets_amount: {
            label: this.$t('assets.Assets'),
            width: '160px',
            formatter: AmountFormatter,
            formatterArgs: {
              async: true,
              permissions: 'assets.view_asset',
              routeQuery: {
                activeTab: 'AssetList'
              }
            }
          },
          gateways: {
            label: this.$t('assets.Gateway'),
            formatter: AmountFormatter,
            formatterArgs: {
              permissions: 'assets.view_gateway',
              routeQuery: {
                activeTab: 'GatewayList'
              }
            }
          }
        }
      },
      headerActions: {
        hasLabelSearch: true,
        createRoute: 'DomainCreate'
      },
      notice: this.$t('assets.DomainHelpMessage')
    }
  }
}
</script>

<style>

</style>
