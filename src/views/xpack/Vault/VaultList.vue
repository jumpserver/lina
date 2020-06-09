<template>
  <div>
    <GenericTreeListPage ref="TreeTablePage" :tree-setting="treeSetting">
      <template #table>
        <AssetUserTable ref="table" v-bind="assetUserConfig" />
      </template>
    </GenericTreeListPage>
  </div>
</template>

<script>
import GenericTreeListPage from '@/layout/components/GenericTreeListPage'
import { AssetUserTable } from '@/components'
import { setUrlParam } from '@/utils/common'

export default {
  name: 'Vault',
  components: {
    GenericTreeListPage,
    AssetUserTable
  },
  data() {
    const vm = this
    return {
      assetUserConfig: {
        hasLeftActions: true,
        hasCreate: true,
        url: '/api/v1/assets/asset-users/?latest=1'
      },
      treeSetting: {
        showMenu: false,
        showRefresh: false,
        showAssets: true,
        url: '/api/v1/assets/asset-users/',
        treeUrl: '/api/v1/assets/nodes/children/tree/?assets=1',
        callback: {
          onSelected: function(event, treeNode) {
            let url = vm.assetUserConfig.url
            if (treeNode.meta.type === 'node') {
              const nodeId = treeNode.meta.node.id
              url = setUrlParam(url, 'asset_id', '')
              url = setUrlParam(url, 'node_id', nodeId)
            } else if (treeNode.meta.type === 'asset') {
              const assetId = treeNode.meta.asset.id
              console.log('Asset id: ', assetId)
              url = setUrlParam(url, 'node_id', '')
              url = setUrlParam(url, 'asset_id', assetId)
            }
            setTimeout(() => {
              vm.assetUserConfig.url = url
            }, 100)
          }
        }
      }
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>
