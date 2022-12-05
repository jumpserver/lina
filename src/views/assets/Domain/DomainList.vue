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
        columns: [
          'name', 'asset_count', 'gateway_count', 'comment',
          'date_created', 'org_name', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'asset_count', 'gateway_count', 'comment', 'actions']
        },
        columnsMeta: {
          asset_count: {
            prop: 'assets',
            label: this.$t('assets.Assets'),
            formatter: function(row) {
              return <span> { row.assets.length } </span>
            }
          },
          gateway_count: {
            prop: 'gateways',
            label: this.$t('assets.Gateway'),
            formatter: DetailFormatter,
            formatterArgs: {
              permissions: 'assets.view_gateway',
              routeQuery: {
                activeTab: 'GatewayList'
              },
              getTitle: function({ cellValue }) {
                return cellValue.length
              }
            }
          }
        }
      },
      headerActions: {
        hasMoreActions: false,
        createRoute: 'DomainCreate'
      },
      notice: this.$t('assets.DomainHelpMessage')
    }
  }
}
</script>

<style>

</style>
