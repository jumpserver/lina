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
import { setUrlParam, setRouterQuery } from '@/utils/common'

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
        activeMenu: 'OrganizationAsset',
        submenu: [
          {
            title: this.$t('assets.OrganizationAsset'),
            name: 'OrganizationAsset',
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
              treeUrl: '/api/v1/assets/nodes/children/tree/?assets=1',
              callback: {
                onSelected: (event, treeNode) => this.getAssetsUrl(treeNode)
              }
            }
          },
          {
            title: this.$t('assets.PersonalAsset'),
            name: 'PersonalAsset',
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
              url: '/api/v1/assets/assets/',
              nodeUrl: '/api/v1/assets/nodes/',
              treeUrl: '/api/v1/assets/nodes/children/tree/?assets=0',
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
        url = setUrlParam(url, 'asset', '')
        url = setUrlParam(url, 'node', nodeId)
      } else if (treeNode.meta.type === 'asset') {
        const assetId = treeNode.meta.data?.id || treeNode.id
        url = setUrlParam(url, 'node', '')
        url = setUrlParam(url, 'asset', assetId)
      }
      this.$set(this.tableConfig, 'url', url)
      setRouterQuery(this)
    }
  }
}
</script>

<style lang="scss" scoped>
.asset-select-dialog >>> .transition-box:first-child {
  background-color: #f3f3f3;
}
</style>
