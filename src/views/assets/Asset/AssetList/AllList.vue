<template>
  <div>
    <TreeTable
      ref="TreeList"
      :table-config="tableConfig"
      :help-message="helpMessage"
      :header-actions="headerActions"
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

    <AssetBulkUpdateDialog
      :visible.sync="updateSelectedDialogSetting.visible"
      v-bind="updateSelectedDialogSetting"
    />
    <PlatformDialog #platform-dialog :visible.sync="showPlatform" :category="category" />
  </div>
</template>

<script>
import { TreeTable } from '@/components'
import $ from '@/utils/jquery-vendor'
import { mapGetters } from 'vuex'
import AssetBulkUpdateDialog from './components/AssetBulkUpdateDialog'
import TreeMenu from './components/TreeMenu'
import PlatformDialog from './components/PlatformDialog'
import BaseList from './components/BaseList'

export default {
  components: {
    TreeTable,
    AssetBulkUpdateDialog,
    TreeMenu,
    PlatformDialog,
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
        treeUrl: '/api/v1/assets/nodes/children/tree/?assets=0'
      },
      tableConfig: {
        url: '/api/v1/assets/assets/'
      },
      headerActions: {
        onCreate: () => {
          this.showPlatform = true
        }
      },
      helpMessage: this.$t('assets.AssetListHelpMessage'),
      updateSelectedDialogSetting: {
        visible: false,
        selectedRows: []
      }
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
    }
  }
}
</script>

<style lang="scss" scoped>
.asset-select-dialog >>> .transition-box:first-child {
  background-color: #f3f3f3;
}
</style>
