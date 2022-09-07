<template>
  <div>
    <TreeTable
      ref="TreeList"
      :table-config="tableConfig"
      :help-message="helpMessage"
      :tree-setting="treeSetting"
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
import { setUrlParam } from '@/utils/common'

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
        url = setUrlParam(url, 'asset', '')
        url = setUrlParam(url, 'node', nodeId)
      } else if (treeNode.meta.type === 'asset') {
        const assetId = treeNode.meta.data.id
        url = setUrlParam(url, 'node', '')
        url = setUrlParam(url, 'asset', assetId)
      }
      this.$set(this.tableConfig, 'url', url)
    }
  }
}
</script>

<style lang="scss" scoped>
.asset-select-dialog >>> .transition-box:first-child {
  background-color: #f3f3f3;
}
</style>
