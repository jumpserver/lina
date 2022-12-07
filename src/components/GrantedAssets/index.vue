<template>
  <TreeTable :table-config="tableConfig" :header-actions="headerActions" :tree-setting="treeSetting" />
</template>

<script type="text/jsx">
import { AccountShowFormatter, DetailFormatter } from '@/components/TableFormatters'
import TreeTable from '../TreeTable'

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
        columns: [
          {
            prop: 'name',
            label: this.$t('assets.Name'),
            formatter: DetailFormatter,
            sortable: true,
            formatterArgs: {
              route: 'AssetDetail'
            },
            showOverflowTooltip: true
          },
          {
            prop: 'address',
            label: this.$t('assets.Address'),
            width: '140px',
            sortable: 'custom'
          },
          {
            prop: 'accounts',
            label: this.$t('assets.Account'),
            align: 'center',
            formatter: AccountShowFormatter,
            formatterArgs: {
              getUrl: this.getShowUrl.bind(this)
            },
            showOverflowTooltip: true
          }
        ]
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
