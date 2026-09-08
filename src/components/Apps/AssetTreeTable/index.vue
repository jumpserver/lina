<template>
  <TreeTable
    v-bind="$attrs"
    ref="TreeList"
    v-model:active-menu="treeTabConfig.activeMenu"
    :component="treeComponent"
    :table-config="tableConfig"
    :tree-tab-config="visibleTreeTabConfig"
    :tree-initial-max-width="treeInitialMaxWidth"
    :tree-width="treeWidth"
    class="asset-tree-table"
  >
    <template v-if="$slots.table" #table>
      <slot name="table" />
    </template>
    <template v-if="$slots['search-after']" #search-after>
      <slot name="search-after" />
    </template>
    <template #rMenu="slotProps">
      <div>
        <slot name="rMenu" v-bind="slotProps" />
      </div>
    </template>
  </TreeTable>
</template>

<script>
import {
  NODE_TREE_METRICS_URL,
  createTypeTreeMetricsLoader,
  typeTreeStructureUrl
} from '@/components/Tree/metrics'
import TreeTable from '../../Table/TreeTable/index.vue'
import { createXTreeSetting, X_TREE_LOAD_MODES } from '@/components/Tree/XTree/config'
import {
  getShowCurrentAssetValue,
  setRouterQuery,
  setUrlParam,
  updateUrlParams
} from '@/utils/common/index'

const NODE_ASSET_SEARCH_URL = '/api/v1/assets/node-assets/tree/search/'
const NODE_TREE_PAGE_SIZE = 100

export default {
  components: {
    TreeTable
  },
  props: {
    url: {
      type: String,
      default: '/api/v1/assets/assets/'
    },
    typeUrl: {
      type: String,
      default: '/api/v1/assets/nodes/category/tree/'
    },
    nodeUrl: {
      type: String,
      default: '/api/v1/assets/nodes/'
    },
    treeUrl: {
      type: String,
      default: '/api/v1/assets/nodes/children/tree/'
    },
    treeAmountUrl: {
      type: String,
      default: NODE_TREE_METRICS_URL
    },
    treeUrlQuery: {
      type: Object,
      default: () => ({})
    },
    treeSetting: {
      type: Object,
      default: () => ({})
    },
    additionalTreeViews: {
      type: Array,
      default: () => []
    },
    tableConfig: {
      type: Object,
      default: () => ({})
    },
    showAssets: {
      type: Boolean,
      default: false
    },
    treeWidth: {
      type: String,
      default: '20%'
    },
    treeInitialMaxWidth: {
      type: Number,
      default: 320
    },
    rememberTreeView: {
      type: Boolean,
      default: true
    }
  },
  data() {
    const showAssets = this.treeSetting?.showAssets || this.showAssets
    const treeUrlQuery = this.setTreeUrlQuery()
    const isAssetNodeTree = this.treeUrl.includes('/api/v1/assets/nodes/')
    const assetTreeUrl = `${this.treeUrl}${treeUrlQuery ? `?${treeUrlQuery}` : ''}`
    const assetTreeWithAssetsUrl = showAssets
      ? setUrlParam(assetTreeUrl, isAssetNodeTree ? 'include_assets' : 'assets', '1')
      : assetTreeUrl
    const assetTreeLazyUrl = setUrlParam(
      assetTreeWithAssetsUrl,
      isAssetNodeTree ? 'include_asset_count' : 'asset_amount',
      '0'
    )
    const isGlobalOrg = this.$store.getters.currentOrgIsRoot
    const paginateNodeChildren = isAssetNodeTree && !showAssets
    const assetTreeChildrenUrl = paginateNodeChildren
      ? setUrlParam(assetTreeLazyUrl, 'node_page_size', NODE_TREE_PAGE_SIZE)
      : assetTreeLazyUrl
    let assetTreeStructureUrl =
      isAssetNodeTree || showAssets
        ? assetTreeChildrenUrl
        : setUrlParam(assetTreeChildrenUrl, 'all', 'all')
    if (!showAssets && !isAssetNodeTree) {
      assetTreeStructureUrl = setUrlParam(assetTreeStructureUrl, 'compact', '1')
    }
    const assetTreeAmountUrl = isAssetNodeTree ? this.treeAmountUrl : ''
    const searchAssetTree = isAssetNodeTree
      ? ({ keyword, signal }) =>
          this.$axios.get(NODE_ASSET_SEARCH_URL, {
            params: {
              search: keyword,
              target: showAssets ? 'all' : 'node'
            },
            signal
          })
      : undefined
    const typeTreeParams = new URLSearchParams()
    if (showAssets) typeTreeParams.set('assets', '1')
    if (this.treeSetting.countResource) {
      typeTreeParams.set('count_resource', this.treeSetting.countResource)
    }
    const typeTreeUrl = typeTreeStructureUrl(
      `${this.typeUrl}${typeTreeParams.size ? `?${typeTreeParams}` : ''}`
    )
    const searchTypeTree = ({ keyword, signal }) =>
      this.$axios.get(typeTreeUrl, {
        params: { search: keyword },
        signal
      })
    return {
      treeComponent: 'TabTree',
      treeTabConfig: {
        activeMenu: 'CustomTree',
        rememberActiveMenu: this.rememberTreeView,
        treeComponent: 'XTree',
        submenu: [
          {
            title:
              this.treeSetting?.treeTitle ||
              (this.treeSetting?.treeComponent === 'NodeAssetTree'
                ? this.$t('NodeAssetTree')
                : this.$t('NodeTree')),
            name: 'CustomTree',
            icon:
              this.treeSetting?.treeIcon ||
              (this.treeSetting?.treeComponent === 'NodeAssetTree'
                ? 'fa-solid fa-desktop'
                : 'fa-solid fa-diagram-project'),
            treeComponent: this.treeSetting?.treeComponent || 'XTree',
            treeSetting: createXTreeSetting({
              showAssets,
              showMenu: false,
              showRefresh: true,
              showCollapse: this.treeSetting?.showCollapse !== false,
              showCreate: true,
              showUpdate: true,
              showDelete: true,
              hasRightMenu: true,
              showSearch: true,
              url: this.url,
              nodeUrl: this.nodeUrl,
              treeUrl: assetTreeChildrenUrl,
              structureUrl: assetTreeStructureUrl,
              countUrl: assetTreeAmountUrl,
              childrenPagination: paginateNodeChildren,
              initialExpandedKeys: isAssetNodeTree && isGlobalOrg ? [] : null,
              loadMode:
                isAssetNodeTree || showAssets ? X_TREE_LOAD_MODES.LAZY : X_TREE_LOAD_MODES.EAGER,
              search: searchAssetTree,
              callback: {
                onSelected: (event, treeNode, context) =>
                  this.getAssetsUrl(treeNode, context?.assetScope),
                onAssetScopeChange: (assetScope, currentNode) => {
                  if (!currentNode) {
                    this.updateAssetScopeUrl(assetScope)
                  }
                },
                beforeRefresh: () => {
                  const query = { ...this.$route.query, node_id: '', asset_id: '' }
                  setTimeout(() => {
                    setRouterQuery(this, `?${new URLSearchParams(query)}`, {
                      browserOnly: true
                    })
                  }, 100)
                }
              },
              ...this.treeSetting
            })
          },
          {
            title: this.$t('TypeTree'),
            icon: 'fa-solid fa-shapes',
            name: 'BuiltinTree',
            treeComponent: 'XTree',
            treeSetting: createXTreeSetting({
              showRefresh: true,
              showCollapse: true,
              amountInLabel:
                typeTreeUrl === this.typeUrl && this.treeSetting.countResource !== 'none',
              loadNodeAmounts: createTypeTreeMetricsLoader(
                this.$axios,
                this.typeUrl,
                this.treeSetting.countResource || 'asset'
              ),
              amountTypes: ['category', 'type', 'platform'],
              countResource: this.treeSetting.countResource || 'asset',
              showAssets: false,
              showSearch: true,
              search: searchTypeTree,
              lazyLoad: false,
              customTreeHeaderName: this.$t('TypeTree'),
              url: this.typeUrl,
              nodeUrl: this.treeSetting?.nodeUrl || this.nodeUrl,
              treeUrl: typeTreeUrl,
              callback: {
                onSelected: (event, treeNode) => this.getAssetsUrl(treeNode)
              },
              edit: {
                drag: {
                  isMove: false
                }
              }
            })
          },
          ...this.additionalTreeViews.map((item) => ({
            ...item,
            treeComponent: item.treeComponent || 'XTree',
            treeSetting: createXTreeSetting(item.treeSetting || {})
          }))
        ]
      }
    }
  },
  computed: {
    visibleTreeTabConfig() {
      if (!this.treeSetting.notShowBuiltinTree) {
        return this.treeTabConfig
      }
      return {
        ...this.treeTabConfig,
        submenu: this.treeTabConfig.submenu.filter((item) => item.name !== 'BuiltinTree')
      }
    }
  },
  mounted() {
    const treeSetting = this.treeTabConfig.submenu[0].treeSetting
    treeSetting.hasRightMenu = !this.currentOrgIsRoot
    treeSetting.showCreate = this.$hasPerm('assets.add_node')
    treeSetting.showUpdate = this.$hasPerm('assets.change_node')
    treeSetting.showDelete = this.$hasPerm('assets.delete_node')
  },
  methods: {
    reloadTable() {
      this.$refs.TreeList.reloadTable()
    },
    getTreeSnapshot() {
      return this.$refs.TreeList?.getTreeSnapshot?.()
    },
    refreshTreeView(treeName) {
      return this.$refs.TreeList?.refreshTreeView?.(treeName)
    },
    getSelectedNodes() {
      return this.$refs.TreeList?.getSelectedNodes?.() || []
    },
    reloadVisibleTreeMetrics(options) {
      return this.$refs.TreeList?.reloadVisibleMetrics?.(options)
    },
    invalidateNormalMetrics() {
      return this.$refs.TreeList?.invalidateNormalMetrics?.()
    },
    setPermissionScope(scope) {
      return this.$refs.TreeList?.setPermissionScope?.(scope)
    },
    toggleRowSelection(row, isSelected) {
      return this.$refs.TreeList?.toggleRowSelection(row, isSelected)
    },
    setTreeUrlQuery() {
      return new URLSearchParams(
        Object.entries(this.treeUrlQuery).filter(
          ([, value]) => value !== '' && value !== null && value !== undefined
        )
      ).toString()
    },
    updateTableUrl(url) {
      const treeList = this.$refs.TreeList
      if (treeList?.handleUrlChange) {
        treeList.handleUrlChange(url)
      } else {
        this.tableConfig.url = url
      }
    },
    appendTreeUrlQuery(url) {
      for (const [key, value] of Object.entries(this.treeUrlQuery)) {
        url = setUrlParam(url, key, value)
      }
      return url
    },
    updateAssetScopeUrl(assetScope) {
      const currentUrl = this.$refs.TreeList?.iTableConfig?.url || this.treeSetting?.url || this.url
      const url = this.applyNodeScopeToUrl(currentUrl, assetScope)
      this.updateTableUrl(url)
      if (this.treeSetting.selectSyncToRoute !== false) {
        setRouterQuery(this, url, { browserOnly: true })
      }
    },
    applyNodeScopeToUrl(url, assetScope) {
      if (this.treeSetting.countResource === 'none') {
        return updateUrlParams(url, { show_current_asset: null, include_descendants: null })
      }
      if (this.treeSetting.countResource === 'account') {
        return updateUrlParams(url, {
          show_current_asset: null,
          include_descendants: String(assetScope) === '1' ? false : null
        })
      }
      return setUrlParam(url, 'show_current_asset', assetScope)
    },

    getAssetsUrl(treeNode, selectedAssetScope) {
      let url = this.treeSetting?.url || this.url
      const showCurrentAsset = selectedAssetScope ?? getShowCurrentAssetValue(this.$cookie)
      const nodeType = treeNode.meta?.type

      if (nodeType === 'node') {
        const nodeId = treeNode.meta.data.id
        url = setUrlParam(url, 'node_id', nodeId)
        url = updateUrlParams(url, { asset_id: null })
        url = this.applyNodeScopeToUrl(url, showCurrentAsset)
      } else if (nodeType === 'asset') {
        const assetId = treeNode.meta.data?.id || treeNode.id
        url = updateUrlParams(url, { node_id: null })
        url = setUrlParam(url, 'asset_id', assetId)
        url = ['account', 'none'].includes(this.treeSetting.countResource)
          ? updateUrlParams(url, { show_current_asset: null, include_descendants: null })
          : setUrlParam(url, 'show_current_asset', showCurrentAsset)
      } else if (nodeType === 'category') {
        url = setUrlParam(url, 'category', treeNode.meta.category)
      } else if (nodeType === 'type') {
        url = setUrlParam(url, 'category', treeNode.meta.category)
        url = setUrlParam(url, 'type', treeNode.meta._type)
      } else if (nodeType === 'platform') {
        url = setUrlParam(url, 'platform', treeNode.id)
      }
      url = this.appendTreeUrlQuery(url)
      this.updateTableUrl(url)

      if (this.treeSetting.selectSyncToRoute !== false) {
        setRouterQuery(this, url, { browserOnly: true })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.asset-tree-table.tree-table-content > :deep(.left) {
  border: 0;
}
</style>
