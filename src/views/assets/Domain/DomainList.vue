<template>
  <div>
    <GenericListPage :header-actions="headerActions" :help-message="notice" :table-config="tableConfig" />
    <DomainCreateUpdate :visible.sync="showCreateUpdate" />
  </div>
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import DomainCreateUpdate from './DomainCreateUpdate.vue'
import AmountFormatter from '@/components/Table/TableFormatters/AmountFormatter.vue'

export default {
  components: {
    GenericListPage,
    DomainCreateUpdate
  },
  data() {
    return {
      showCreateUpdate: false,
      tableConfig: {
        url: '/api/v1/assets/domains/',
        columnsExclude: ['gateway'],
        columnsExtra: ['gateway_count'],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'assets', 'gateway_count', 'comment', 'actions']
        },
        columnsMeta: {
          assets: {
            label: this.$t('assets.Assets'),
            width: '160px',
            formatter: AmountFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'GroupUser'
              }
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
        createRoute: 'DomainCreate',
        onCreate: () => {
          this.showCreateUpdate = true
        }
      },
      notice: this.$t('assets.DomainHelpMessage')
    }
  }
}
</script>

<style>

</style>
