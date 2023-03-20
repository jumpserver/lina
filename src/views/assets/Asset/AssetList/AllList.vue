<template>
  <div>
    <AssetTreeTable
      ref="AssetTreeTable"
      :help-message="helpMessage"
      :table-config="tableConfig"
      :tree-setting="treeSetting"
    >
      <TreeMenu
        slot="rMenu"
        :tree="treeRef"
        @showAll="showAll"
      />
      <BaseList
        slot="table"
        :add-extra-more-actions="addExtraMoreActions"
        :header-actions="headerActions"
        v-bind="tableConfig"
      />
    </AssetTreeTable>
  </div>
</template>

<script>
import { AssetTreeTable } from '@/components'
import { mapGetters } from 'vuex'
import TreeMenu from './components/TreeMenu'
import BaseList from './components/BaseList'
import $ from '@/utils/jquery-vendor'
import { setRouterQuery, setUrlParam } from '@/utils/common'

export default {
  components: {
    AssetTreeTable,
    TreeMenu,
    BaseList
  },
  data() {
    const tableUrl = '/api/v1/assets/assets/'
    return {
      treeRef: null,
      showPlatform: false,
      category: 'all',
      treeSetting: {
        url: '/api/v1/assets/assets/',
        showMenu: !this.$store.getters.currentOrgIsRoot
      },
      tableConfig: {
        url: tableUrl,
        category: 'all'
      },
      headerActions: {
        handleImportClick: ({ selectedRows }) => {
          this.$message.warning({
            message: this.$t('assets.ImportMessage')
          })
        }
      },
      addExtraMoreActions: [],
      helpMessage: this.$t('assets.AssetListHelpMessage')
    }
  },
  computed: {
    ...mapGetters(['currentOrgIsRoot'])
  },
  mounted() {
    this.treeRef = this.$refs.AssetTreeTable.$refs.TreeList
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
      this.$refs.AssetTreeTable.$refs.TreeList.handleUrlChange(url)
    },
    getAssetsUrl(treeNode) {
      let url = '/api/v1/assets/assets/'
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

<style lang="scss" scoped>
.asset-select-dialog > > > .transition-box:first-child {
  background-color: #f3f3f3;
}
</style>
