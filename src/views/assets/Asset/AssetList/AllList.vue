<template>
  <div>
    <TreeTable
      ref="TreeList"
      :table-config="tableConfig"
      :help-message="helpMessage"
      component="TreeTab"
      :active-menu.sync="treeTabConfig.activeMenu"
      :tree-tab-config="treeTabConfig"
    >
      <TreeMenu
        slot="rMenu"
        :tree="treeRef"
        @showAll="showAll"
      />
      <BaseList
        slot="table"
        v-bind="tableConfig"
      />
    </TreeTable>
  </div>
</template>

<script>
import { TreeTable } from '@/components'
import $ from '@/utils/jquery-vendor'
import { mapGetters } from 'vuex'
import TreeMenu from './components/TreeMenu'
import BaseList from './components/BaseList'
import { setRouterQuery, setUrlParam } from '@/utils/common'

export default {
  components: {
    TreeTable,
    TreeMenu,
    BaseList
  },
  data() {
    return {
      treeRef: null,
      showPlatform: false,
      category: 'all',
      treeSetting: {
        showMenu: true,
        showRefresh: true,
        showAssets: false,
        showCreate: true,
        showUpdate: true,
        showDelete: true,
        hasRightMenu: true,
        showSearch: true,
        customTreeHeader: true,
        url: '/api/v1/assets/assets/',
        nodeUrl: '/api/v1/assets/nodes/',
        // ?assets=0不显示资产. =1显示资产
        treeUrl: '/api/v1/assets/nodes/children/tree/?assets=0',
        callback: {
          onSelected: (event, treeNode) => this.getAssetsUrl(treeNode)
        }
      },
      tableConfig: {
        url: '/api/v1/assets/assets/',
        category: 'all'
      },
      treeTabConfig: {
        activeMenu: 'CustomTree',
        submenu: [
          {
            title: this.$t('assets.AssetTree'),
            name: 'CustomTree',
            treeSetting: {
              showMenu: false,
              showRefresh: true,
              showAssets: false,
              url: '/api/v1/assets/accounts/',
              treeUrl: '/api/v1/assets/nodes/children/tree/?assets=1'
            }
          },
          {
            title: this.$t('assets.BuiltinTree'),
            name: 'BuiltinTree',
            treeSetting: {
              showMenu: true,
              showRefresh: true,
              showAssets: false,
              showCreate: true,
              showUpdate: true,
              showDelete: true,
              hasRightMenu: true,
              showSearch: true,
              // customTreeHeader: true,
              url: '/api/v1/assets/nodes/category/tree/',
              nodeUrl: '/api/v1/assets/nodes/',
              treeUrl: '/api/v1/assets/nodes/category/tree/',
              callback: {
                onSelected: (event, treeNode) => this.getAssetsUrl(treeNode)
              }
            }
          }
        ]
      },
      helpMessage: this.$t('assets.AssetListHelpMessage')
    }
  },
  computed: {
    ...mapGetters(['currentOrgIsRoot'])
  },
  mounted() {
    this.decorateRMenu()
    this.treeSetting.hasRightMenu = !this.currentOrgIsRoot
    this.treeSetting.showCreate = this.$hasPerm('assets.add_node')
    this.treeSetting.showUpdate = this.$hasPerm('assets.change_node')
    this.treeSetting.showDelete = this.$hasPerm('assets.delete_node')
    this.treeRef = this.$refs.TreeList
  },
  methods: {
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
    showAll({ node, showCurrentAsset }) {
      this.$cookie.set('show_current_asset', showCurrentAsset, 1)
      this.decorateRMenu()
      const url = `${this.treeSetting.url}?node_id=${node.meta.data.id}&show_current_asset=${showCurrentAsset}`
      this.$refs.TreeList.$refs.TreeTable.handleUrlChange(url)
    },
    getAssetsUrl(treeNode) {
      let url = '/api/v1/assets/assets/'
      if (treeNode.meta.type === 'node') {
        const nodeId = treeNode.meta.data.id
        url = setUrlParam(url, 'node', nodeId)
      } else if (treeNode.meta.type === 'asset') {
        const assetId = treeNode.meta.data?.id || treeNode.id
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

<style lang="scss" scoped>
.asset-select-dialog > > > .transition-box:first-child {
  background-color: #f3f3f3;
}
</style>
