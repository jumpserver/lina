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
        :add-extra-more-actions="addExtraMoreActions"
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
    const vm = this
    return {
      treeRef: null,
      showPlatform: false,
      category: 'all',
      tableConfig: {
        url: '/api/v1/assets/assets/',
        category: 'all'
      },
      addExtraMoreActions: [
        {
          name: 'RemoveFromCurrentNode',
          title: this.$t('assets.RemoveFromCurrentNode'),
          can: ({ selectedRows }) => {
            if (!vm.$route.query.node) {
              return false
            }
            return selectedRows.length > 0 &&
              !vm.currentOrgIsRoot &&
              vm.$hasPerm('assets.change_node')
          },
          callback: function({ selectedRows, reloadTable }) {
            const assetsId = []
            for (const item of selectedRows) {
              assetsId.push(item.id)
            }
            const nodeId = this.$route.query.node
            if (!nodeId) return
            const url = `/api/v1/assets/nodes/${nodeId}/assets/remove/`
            this.$axios.put(url, { assets: assetsId }).then(res => {
              this.$message.success(this.$t('common.removeSuccessMsg'))
              reloadTable()
            }).catch(err => {
              this.$message.error(this.$t('common.removeErrorMsg' + ' ' + err))
            })
          }.bind(this)
        }
      ],
      treeTabConfig: {
        activeMenu: 'CustomTree',
        submenu: [
          {
            title: this.$t('assets.AssetTree'),
            name: 'CustomTree',
            treeSetting: {
              showMenu: true,
              showRefresh: true,
              showAssets: false,
              showCreate: true,
              showUpdate: true,
              showDelete: true,
              hasRightMenu: true,
              showSearch: true,
              url: '/api/v1/assets/assets/',
              nodeUrl: '/api/v1/assets/nodes/',
              treeUrl: '/api/v1/assets/nodes/children/tree/?assets=0',
              callback: {
                onSelected: (event, treeNode) => this.getAssetsUrl(treeNode)
              }
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
    const treeSetting = this.treeTabConfig.submenu[0].treeSetting
    treeSetting.hasRightMenu = !this.currentOrgIsRoot
    treeSetting.showCreate = this.$hasPerm('assets.add_node')
    treeSetting.showUpdate = this.$hasPerm('assets.change_node')
    treeSetting.showDelete = this.$hasPerm('assets.delete_node')
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
.asset-select-dialog /deep/ .transition-box:first-child {
  background-color: #f3f3f3;
}
</style>
