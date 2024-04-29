<template>
  <TreeTable :header-actions="headerActions" :table-config="tableConfig" :tree-setting="treeSetting" />
</template>

<script type="text/jsx">
import TreeTable from '../../Table/TreeTable/index.vue'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import { AccountInfoFormatter } from '@/components/Table/TableFormatters'
import { connectivityMeta } from '@/components/Apps/AccountListTable/const'

export default {
  name: 'GrantedAssets',
  components: {
    TreeTable
  },
  props: {
    treeUrl: {
      type: String,
      required: true
    },
    tableUrl: {
      type: String,
      required: true
    },
    onSelected: {
      type: Function,
      default(node, vm) {
        if (!vm.tableConfig.initialUrl) {
          vm.tableConfig.initialUrl = vm.tableConfig.url
        }
        const initialUrl = vm.tableConfig.initialUrl
        const nodeId = node.meta.data.id
        const url = initialUrl.replace('/assets/', `/nodes/${nodeId}/assets/`)
        vm.tableConfig.url = url
      }
    },
    getShowUrl: {
      type: Function,
      default({ row, col }) {
        return this.tableUrl.replace('/assets/', `/assets/${row.id}/accounts/`)
      }
    }
  },
  data() {
    const vm = this
    return {
      treeSetting: {
        showMenu: false,
        showRefresh: true,
        showAssets: false,
        url: this.tableUrl,
        // ?assets=0不显示资产. =1显示资产
        treeUrl: this.treeUrl,
        callback: {
          onSelected: (event, node) => vm.onSelected(node, vm),
          refresh: vm.refreshObjectAssetPermission
        }
      },
      tableConfig: {
        url: this.tableUrl,
        hasTree: true,
        columnsExtra: ['view_account'],
        columnsExclude: ['spec_info'],
        columnsShow: {
          min: ['name', 'address', 'accounts'],
          default: ['name', 'address', 'platform', 'view_account', 'connectivity']
        },
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AssetDetail'
            }
          },
          actions: {
            has: false
          },
          view_account: {
            label: this.$t('assets.Account'),
            formatter: AccountInfoFormatter,
            width: '100px'
          },
          connectivity: connectivityMeta
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasExport: false,
        hasImport: false
      }
    }
  },
  methods: {
    refreshObjectAssetPermission() {
      const url = this.tableUrl.replace('/assets/', '/asset-permissions/cache/')
      if (url.indexOf('user-groups')) {
        return false
      }
      return this.$axios.delete(url)
    }
  }
}
</script>

<style scoped>
</style>
