<template>
  <div>
    <AssetTreeTable
      ref="AssetTreeTable"
      :help-tip="helpMessage"
      :table-config="tableConfig"
      :tree-setting="treeSetting"
      @url-change="handleTreeUrlChange"
    >
      <template #rMenu>
        <TreeMenu :tree="treeRef" />
      </template>
      <template #table>
        <BaseList
          v-bind="tableConfig"
          ref="baseList"
          :add-extra-more-actions="addExtraMoreActions"
          :header-actions="headerActions"
        />
      </template>
    </AssetTreeTable>
  </div>
</template>

<script>
import { AssetTreeTable } from '@/components'
import { mapGetters } from 'vuex'
import TreeMenu from './components/TreeMenu'
import BaseList from './components/BaseList'
import { setRouterQuery, setUrlParam } from '@/utils/common/index'

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
        showMenu: !this.$store.getters.currentOrgIsRoot,
        showAssetScope: true,
        showDefaultMenu: true,
        selectSyncToRoute: false,
        menu: []
      },
      tableConfig: {
        url: tableUrl,
        category: 'all',
        extraQuery: { order: '-date_updated' }
      },
      headerActions: {
        hasImport: false
      },
      addExtraMoreActions: [],
      helpMessage: this.$t('AssetListHelpMessage')
    }
  },
  computed: {
    ...mapGetters(['currentOrgIsRoot'])
  },
  mounted() {
    this.treeRef = this.$refs.AssetTreeTable.$refs.TreeList
  },
  methods: {
    handleTreeUrlChange(url) {
      this.tableConfig = {
        ...this.tableConfig,
        url
      }
      setRouterQuery(this, url, { browserOnly: true })
      this.$nextTick(() => {
        this.$refs.baseList?.$refs.ListTable?.reloadTable?.()
      })
    },
    getAssetsUrl(treeNode) {
      let url = '/api/v1/assets/assets/'
      const nodeType = treeNode.meta?.type
      if (nodeType === 'node') {
        const nodeId = treeNode.meta.data.id
        url = setUrlParam(url, 'node', nodeId)
        url = setUrlParam(url, 'asset', '')
      } else if (nodeType === 'asset') {
        const assetId = treeNode.meta.data?.id || treeNode.id
        url = setUrlParam(url, 'node', '')
        url = setUrlParam(url, 'asset', assetId)
      } else if (nodeType === 'category') {
        url = setUrlParam(url, 'category', treeNode.meta.category)
      } else if (nodeType === 'type') {
        url = setUrlParam(url, 'category', treeNode.meta.category)
        url = setUrlParam(url, 'type', treeNode.meta._type)
      } else if (nodeType === 'platform') {
        url = setUrlParam(url, 'platform', treeNode.id)
      }
      this.tableConfig['url'] = url
      setRouterQuery(this, url, { browserOnly: true })
    }
  }
}
</script>
