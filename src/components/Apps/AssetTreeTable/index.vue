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
import TreeTable from '../../Table/TreeTable/index.vue'
import { createXTreeSetting } from '@/components/Tree/XTree/config'
import { getShowCurrentAssetValue, setRouterQuery, setUrlParam } from '@/utils/common/index'

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
      default: '/api/v1/assets/nodes/assets-amount/'
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
    }
  },
  data() {
    const showAssets = this.treeSetting?.showAssets || this.showAssets
    const treeUrlQuery = this.setTreeUrlQuery()
    const assetTreeUrl = `${this.treeUrl}?assets=${showAssets ? '1' : '0'}&${treeUrlQuery}`
    const assetTreeLazyUrl = setUrlParam(assetTreeUrl, 'asset_amount', '0')
    const isAssetNodeTree = this.treeUrl.includes('/api/v1/assets/nodes/')
    let assetTreeStructureUrl = showAssets
      ? assetTreeLazyUrl
      : setUrlParam(assetTreeLazyUrl, 'all', 'all')
    if (!showAssets && isAssetNodeTree) {
      assetTreeStructureUrl = setUrlParam(assetTreeStructureUrl, 'compact', '1')
    }
    const assetTreeAmountUrl = isAssetNodeTree ? this.treeAmountUrl : ''
    return {
      treeComponent: 'TabTree',
      treeTabConfig: {
        activeMenu: 'CustomTree',
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
              treeUrl: assetTreeLazyUrl,
              structureUrl: assetTreeStructureUrl,
              countUrl: assetTreeAmountUrl,
              lazyLoad: showAssets,
              callback: {
                onSelected: (event, treeNode, context) =>
                  this.getAssetsUrl(treeNode, context?.assetScope),
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
              showAssets: false,
              showSearch: true,
              lazyLoad: false,
              customTreeHeaderName: this.$t('TypeTree'),
              url: this.typeUrl,
              nodeUrl: this.treeSetting?.nodeUrl || this.nodeUrl,
              treeUrl: `${this.typeUrl}?assets=${showAssets ? '1' : '0'}&count_resource=${this.treeSetting.countResource || 'asset'}`,
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
      return Object.entries(this.treeUrlQuery)
        .map(([key, value]) => `${key}=${value}`)
        .join('&')
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

    getAssetsUrl(treeNode, selectedAssetScope) {
      let url = this.treeSetting?.url || this.url
      const showCurrentAsset = selectedAssetScope ?? getShowCurrentAssetValue(this.$cookie)
      const nodeType = treeNode.meta?.type

      if (nodeType === 'node') {
        const nodeId = treeNode.meta.data.id
        url = setUrlParam(url, 'node_id', nodeId)
        url = setUrlParam(url, 'asset_id', '')
        url = setUrlParam(url, 'show_current_asset', showCurrentAsset)
      } else if (nodeType === 'asset') {
        const assetId = treeNode.meta.data?.id || treeNode.id
        url = setUrlParam(url, 'node_id', '')
        url = setUrlParam(url, 'asset_id', assetId)
        url = setUrlParam(url, 'show_current_asset', showCurrentAsset)
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
