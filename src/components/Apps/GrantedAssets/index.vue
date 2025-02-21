<template>
  <AssetTreeTable
    ref="AssetTreeTable"
    :header-actions="headerActions"
    :table-config="tableConfig"
    :tree-setting="treeSetting"
  />
</template>

<script type="text/jsx">
import AssetTreeTable from '@/components/Apps/AssetTreeTable'
import { AccountInfoFormatter, DetailFormatter } from '@/components/Table/TableFormatters'
import { connectivityMeta } from '@/components/Apps/AccountListTable/const'

export default {
  name: 'GrantedAssets',
  components: {
    AssetTreeTable
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
    actions: {
      type: Object,
      default: null
    },
    getShowUrl: {
      type: Function,
      default({ row, col }) {
        return this.tableUrl.replace('/assets/', `/assets/${row.id}/accounts/`)
      }
    },
    name: {
      type: Object,
      default: () => ({
        formatter: DetailFormatter,
        formatterArgs: {
          route: 'AssetDetail',
          can: true
        }
      })
    },
    comment: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const vm = this
    return {
      treeSetting: {
        showMenu: false,
        showRefresh: true,
        showAssets: false,
        showSearch: false,
        url: this.tableUrl,
        // ?assets=0不显示资产. =1显示资产
        treeUrl: this.treeUrl,
        notShowBuiltinTree: true,
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
          default: ['name', 'address', 'platform', 'view_account', 'actions']
        },
        columnsMeta: {
          name: {
            ...this.name
          },
          labels: {
            formatterArgs: {
              showEditBtn: false
            }
          },
          actions: {
            ...this.actions
          },
          view_account: {
            label: this.$t('Accounts'),
            formatter: AccountInfoFormatter,
            width: '100px'
          },
          connectivity: connectivityMeta,
          comment: { ...this.comment }
        },
        tableAttrs: {
          rowClassName({ row }) {
            return !row.is_active ? 'row_disabled' : ''
          }
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
.row_disabled, .row_disabled:hover, .row_disabled:hover > td {
  cursor: not-allowed;
  background-color: rgba(192, 196, 204, 0.28) !important;
}
</style>
