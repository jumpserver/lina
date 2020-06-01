<template>
  <GenericTreeListPage :table-config="tableConfig" :help-message="helpMessage" :header-actions="headerActions" :tree-setting="treeSetting" />
</template>

<script>
import GenericTreeListPage from '@/layout/components/GenericTreeListPage/index'
import { DetailFormatter, ActionsFormatter, BooleanFormatter } from '@/components/ListTable/formatters'

export default {
  components: {
    GenericTreeListPage
  },
  data() {
    return {
      treeSetting: {
        showMenu: true,
        showRefresh: true,
        showAssets: false,
        url: '/api/v1/assets/assets/',
        nodeUrl: '/api/v1/assets/nodes/',
        // ?assets=0不显示资产. =1显示资产
        treeUrl: '/api/v1/assets/nodes/children/tree/?assets=0'
      },
      tableConfig: {
        url: '/api/v1/assets/assets/',
        hasTree: true,
        columns: [
          'hostname', 'ip', 'hardware_info', 'reachable', 'actions'
        ],
        columnsMeta: {
          hostname: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AssetDetail'
            }
          },
          ip: {
            sortable: 'custom',
            width: '140px'
          },
          hardware_info: {
            showOverflowTooltip: true
          },
          reachable: {
            label: this.$t('assets.Reachable'),
            formatter: BooleanFormatter,
            width: '80px',
            align: 'center'
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/assets/assets/${id}/`
                return this.$axios.delete(url)
              }
            }
          }
        }
      },
      headerActions: {
        createRoute: 'AssetCreate'
      },
      helpMessage: this.$t('assets.AssetListHelpMessage')
    }
  }
}
</script>

<style>

</style>
