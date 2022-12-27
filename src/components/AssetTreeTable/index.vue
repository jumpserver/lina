<template>
  <TreeTable
    ref="TreeList"
    component="TabTree"
    :table-config="tableConfig"
    :active-menu.sync="treeTabConfig.activeMenu"
    :tree-tab-config="treeTabConfig"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>

<script>
import TreeTable from '../TreeTable'
import { setRouterQuery, setUrlParam } from '@/utils/common'

export default {
  components: {
    TreeTable
  },
  props: {
    url: {
      type: String,
      default: '/api/v1/assets/assets/'
    },
    nodeUrl: {
      type: String,
      default: '/api/v1/assets/nodes/'
    },
    treeUrl: {
      type: String,
      default: '/api/v1/assets/nodes/children/tree/'
    },
    treeSetting: {
      type: Object,
      default: () => ({})
    },
    tableConfig: {
      type: Object,
      default: () => ({})
    },
    showAssets: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const showAssets = this.treeSetting?.showAssets || this.showAssets
    return {
      treeTabConfig: {
        activeMenu: 'CustomTree',
        submenu: [
          {
            title: this.$t('assets.AssetTree'),
            name: 'CustomTree',
            treeSetting: {
              showAssets,
              showMenu: true,
              showRefresh: true,
              showCreate: true,
              showUpdate: true,
              showDelete: true,
              hasRightMenu: true,
              showSearch: true,
              url: this.url,
              nodeUrl: this.nodeUrl,
              treeUrl: `${this.treeUrl}?assets=${showAssets ? '1' : '0'}`,
              callback: {
                onSelected: (event, treeNode) => this.getAssetsUrl(treeNode)
              },
              ...this.treeSetting
            }
          },
          {
            title: this.$t('assets.BuiltinTree'),
            name: 'BuiltinTree',
            treeSetting: {
              showRefresh: true,
              showAssets: false,
              showSearch: true,
              customTreeHeaderName: this.$t('assets.BuiltinTree'),
              url: '/api/v1/assets/nodes/category/tree/',
              nodeUrl: this.treeSetting?.nodeUrl || this.nodeUrl,
              treeUrl: `/api/v1/assets/nodes/category/tree/?assets=${showAssets ? '1' : '0'}`,
              callback: {
                onSelected: (event, treeNode) => this.getAssetsUrl(treeNode)
              }
            }
          }
        ]
      }
    }
  },
  methods: {
    getAssetsUrl(treeNode) {
      let url = this.treeSetting?.url || this.url
      if (treeNode.meta.type === 'node') {
        const nodeId = treeNode.meta.data.id
        url = setUrlParam(url, 'node', nodeId)
        url = setUrlParam(url, 'asset', '')
      } else if (treeNode.meta.type === 'asset') {
        const assetId = treeNode.meta.data?.id || treeNode.id
        url = setUrlParam(url, 'node', '')
        url = setUrlParam(url, 'asset', assetId)
      } else if (treeNode.meta.type === 'category') {
        url = setUrlParam(url, 'category', treeNode.meta.category)
      } else if (treeNode.meta.type === 'type') {
        url = setUrlParam(url, 'category', treeNode.meta.category)
        url = setUrlParam(url, 'type', treeNode.meta._type)
      } else if (treeNode.meta.type === 'platform') {
        url = setUrlParam(url, 'platform', treeNode.id)
      }
      this.$set(this.tableConfig, 'url', url)
      setRouterQuery(this, url)
    }
  }
}
</script>

<style lang='scss' scoped>

</style>
