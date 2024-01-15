<template>
  <TreeTable
    ref="TreeList"
    :active-menu.sync="treeTableConfig.activeMenu"
    :table-config="tableConfig"
    :tree-tab-config="treeTableConfig"
    component="TabTree"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template #table>
      <slot name="table" />
    </template>
    <div slot="rMenu" slot-scope="{data}">
      <slot :data="data" name="rMenu" />
    </div>
  </TreeTable>
</template>

<script>
import TreeTable from '../../Table/TreeTable/index.vue'
import { setRouterQuery, setUrlParam } from '@/utils/common'
import $ from '@/utils/jquery-vendor'

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
    treeUrlQuery: {
      type: Object,
      default: () => ({})
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
    const treeUrlQuery = this.setTreeUrlQuery()
    const assetTreeUrl = `${this.treeUrl}?assets=${showAssets ? '1' : '0'}&${treeUrlQuery}`
    const vm = this

    return {
      treeTabConfig: {
        activeMenu: 'CustomTree',
        submenu: [
          {
            title: this.$t('assets.AssetTree'),
            name: 'CustomTree',
            treeSetting: {
              showAssets,
              showMenu: false,
              showRefresh: true,
              showCreate: true,
              showUpdate: true,
              showDelete: true,
              hasRightMenu: true,
              showSearch: true,
              url: this.url,
              nodeUrl: this.nodeUrl,
              treeUrl: assetTreeUrl,
              callback: {
                onSelected: (event, treeNode) => this.getAssetsUrl(treeNode),
                beforeRefresh: () => {
                  const query = { ...this.$route.query, node_id: '', asset_id: '' }
                  setTimeout(() => {
                    vm.$router.replace({ query: query })
                  }, 100)
                }
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
              showSearch: false,
              customTreeHeaderName: this.$t('assets.BuiltinTree'),
              url: '/api/v1/assets/nodes/category/tree/',
              nodeUrl: this.treeSetting?.nodeUrl || this.nodeUrl,
              treeUrl: `/api/v1/assets/nodes/category/tree/?assets=${showAssets ? '1' : '0'}&count_resource=${this.treeSetting.countResource || 'asset'}`,
              callback: {
                onSelected: (event, treeNode) => this.getAssetsUrl(treeNode)
              }
            }
          }
        ]
      }
    }
  },
  computed: {
    treeTableConfig() {
      if (this.treeSetting.notShowBuiltinTree) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.treeTabConfig.submenu.splice(1, 1)
      }
      return this.treeTabConfig
    }
  },
  mounted() {
    this.decorateRMenu()
    const treeSetting = this.treeTabConfig.submenu[0].treeSetting
    treeSetting.hasRightMenu = !this.currentOrgIsRoot
    treeSetting.showCreate = this.$hasPerm('assets.add_node')
    treeSetting.showUpdate = this.$hasPerm('assets.change_node')
    treeSetting.showDelete = this.$hasPerm('assets.delete_node')
  },
  methods: {
    setTreeUrlQuery() {
      let str = ''
      for (const key in this.treeUrlQuery) {
        str += `${key}=${this.treeUrlQuery[key]}&`
      }
      str = str.substr(0, str.length - 1)

      return str
    },
    decorateRMenu() {
      const show_current_asset = this.$cookie.get('show_current_asset') || '0'
      if (show_current_asset === '1') {
        $('#m_show_asset_all_children_node').css('color', '#606266')
        $('#m_show_asset_only_current_node').css('color', 'green')
      } else {
        $('#m_show_asset_all_children_node').css('color', 'green')
        $('#m_show_asset_only_current_node').css('color', '#606266')
      }
    },
    getAssetsUrl(treeNode) {
      let url = this.treeSetting?.url || this.url
      if (treeNode.meta.type === 'node') {
        const nodeId = treeNode.meta.data.id
        url = setUrlParam(url, 'node_id', nodeId)
        url = setUrlParam(url, 'asset_id', '')
      } else if (treeNode.meta.type === 'asset') {
        const assetId = treeNode.meta.data?.id || treeNode.id
        url = setUrlParam(url, 'node_id', '')
        url = setUrlParam(url, 'asset_id', assetId)
      } else if (treeNode.meta.type === 'category') {
        url = setUrlParam(url, 'category', treeNode.meta.category)
      } else if (treeNode.meta.type === 'type') {
        url = setUrlParam(url, 'category', treeNode.meta.category)
        url = setUrlParam(url, 'type', treeNode.meta._type)
      } else if (treeNode.meta.type === 'platform') {
        url = setUrlParam(url, 'platform', treeNode.id)
      }
      const query = this.setTreeUrlQuery()
      url = query ? `${url}&${query}` : url
      this.$set(this.tableConfig, 'url', url)
      setRouterQuery(this, url)
    }
  }
}
</script>

<style lang='scss' scoped>

</style>
