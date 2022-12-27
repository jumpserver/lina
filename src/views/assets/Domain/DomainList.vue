<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" :help-message="notice" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter } from '@/components/TableFormatters'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/assets/domains/',
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'asset_count', 'gateway_count', 'comment', 'actions']
        },
        columnsMeta: {
          asset_count: {
            label: this.$t('assets.Assets'),
            formatter: function(row) {
              return <span> { row.assets.length } </span>
            }
          },
          gateway_count: {
            label: this.$t('assets.Gateway'),
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
        createRoute: 'DomainCreate'
      },
      notice: this.$t('assets.DomainHelpMessage')
    }
  }
}
</script>

<style>

</style>
