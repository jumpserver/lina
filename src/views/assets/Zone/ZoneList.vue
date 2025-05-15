<template>
  <GenericListPage
    :create-drawer="createDrawer"
    :detail-drawer="detailDrawer"
    :header-actions="headerActions"
    :help-tip="notice"
    :table-config="tableConfig"
  />
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
      createDrawer: () => import('./ZoneCreateUpdate.vue'),
      detailDrawer: () => import('@/views/assets/Zone/ZoneDetail/index.vue'),
      tableConfig: {
        url: '/api/v1/assets/zones/',
        columnsExclude: ['gateway'],
        columnsExtra: ['gateways'],
        columns: ['name', 'assets_amount', 'gateways', 'labels', 'comment', 'actions'],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'assets_amount', 'gateways', 'comment', 'actions']
        },
        columnsMeta: {
          assets_amount: {
            width: '160px',
            formatter: AmountFormatter,
            formatterArgs: {
              async: true,
              permissions: 'assets.view_asset',
              getRoute({ row }) {
                return {
                  name: 'ZoneDetail',
                  params: {
                    id: row.id
                  },
                  query: {
                    tab: 'AssetList'
                  }
                }
              }
            }
          },
          gateways: {
            formatter: AmountFormatter,
            formatterArgs: {
              permissions: 'assets.view_gateway',
              getRoute({ row }) {
                return {
                  name: 'ZoneDetail',
                  params: {
                    id: row.id
                  },
                  query: {
                    tab: 'GatewayList'
                  }
                }
              }
            }
          }
        }
      },
      headerActions: {
        hasLabelSearch: true,
        createRoute: 'ZoneCreate'
      },
      notice: this.$t('ZoneHelpMessage')
    }
  }
}
</script>
