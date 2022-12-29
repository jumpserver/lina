<template>
  <div>
    <AssetTreeTAble
      ref="AssetTreeTAble"
      :table-config="tableConfig"
      :tree-setting="treeSetting"
      :help-message="helpMessage"
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
    </AssetTreeTAble>
  </div>
</template>

<script>
import { AssetTreeTAble } from '@/components'
import { mapGetters } from 'vuex'
import TreeMenu from './components/TreeMenu'
import BaseList from './components/BaseList'
import { setRouterQuery, setUrlParam } from '@/utils/common'

export default {
  components: {
    AssetTreeTAble,
    TreeMenu,
    BaseList
  },
  data() {
    const vm = this
    return {
      treeRef: null,
      showPlatform: false,
      category: 'all',
      treeSetting: {
        showMenu: true
      },
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
      helpMessage: this.$t('assets.AssetListHelpMessage')
    }
  },
  computed: {
    ...mapGetters(['currentOrgIsRoot'])
  },
  mounted() {
    this.treeRef = this.$refs.AssetTreeTAble.$refs.TreeList
  },
  methods: {
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
.asset-select-dialog >>> .transition-box:first-child {
  background-color: #f3f3f3;
}
</style>
