<template>
  <div class="asset-select-dialog">
    <AssetDialog
      v-if="visible"
      :base-url="assetsUrl"
      :title="dialogTitle"
      :visible="visible"
      @cancel="assetTreeTableDialogHandleCancel"
      @confirm="assetTreeTableDialogHandleConfirm"
      @update:visible="handleVisibleChange"
    />
  </div>
</template>

<script>
import AssetDialog from '@/components/Apps/AssetSelect/dialog.vue'

export default {
  name: 'NodeAssetsUpdate',
  components: {
    AssetDialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    action: {
      type: String,
      default: 'add'
    },
    selectNode: {
      type: Object,
      default: null
    },
    tree: {
      type: Object,
      default: null
    }
  },
  emits: ['update:visible', 'hide-menu'],
  data() {
    return {
      dialogVisible: false
    }
  },
  computed: {
    dialogTitle() {
      const actionTitleKeys = {
        add: 'AddAssetToNode',
        move: 'MoveAssetToNode',
        remove: 'RemoveAssetFromNode'
      }
      const title = this.$t(actionTitleKeys[this.action] || 'AssetManagement')
      const nodeName = this.selectNode?.name || this.selectNode?.meta?.data?.value
      return nodeName ? `${title} - ${nodeName}` : title
    },
    assetsUrl() {
      if (this.action === 'remove') {
        return '/api/v1/assets/assets/?node_id=' + this.selectNode.meta.data.id
      } else {
        return `/api/v1/assets/assets/`
      }
    }
  },
  methods: {
    handleVisibleChange(val) {
      this.$emit('hide-menu')
      this.$emit('update:visible', val)
    },
    assetTreeTableDialogHandleConfirm(assetsSelected, assetRows = []) {
      if (!assetsSelected) {
        return
      }
      const currentNode = this.selectNode
      if (!currentNode || assetsSelected.length === 0) {
        return
      }
      const affectedNodeIds = this.getAffectedNodeIds(assetsSelected, assetRows, currentNode)
      let url
      switch (this.action) {
        case 'add':
          url = `/api/v1/assets/nodes/${currentNode.meta.data.id}/assets/add/`
          break
        case 'move':
          url = `/api/v1/assets/nodes/${currentNode.meta.data.id}/assets/replace/`
          break
        case 'remove':
          url = `/api/v1/assets/nodes/${currentNode.meta.data.id}/assets/remove/`
          break
        default:
          return
      }
      this.$axios
        .put(url, { assets: assetsSelected })
        .then(() => {
          this.tree?.refreshAssetRelationAmounts?.(affectedNodeIds)
          this.$emit('hide-menu')
          this.$emit('update:visible', false)
          this.assetsSelected = []
          this.$message.success(this.$tc('UpdateSuccessMsg'))
        })
        .catch((error) => {
          this.$emit('hide-menu')
          this.$message.error(this.$tc('UpdateErrorMsg' + ' ' + error))
        })
    },
    getAffectedNodeIds(assetIds, assetRows, currentNode) {
      const nodeIds = new Set([String(currentNode.meta.data.id)])
      if (this.action === 'add') {
        return [...nodeIds]
      }

      const selectedAssetIds = new Set(assetIds.map(String))
      const selectedAssetRows = Array.isArray(assetRows) ? assetRows : []
      selectedAssetRows
        .filter((asset) => selectedAssetIds.has(String(asset.id)))
        .forEach((asset) => {
          const assetNodeIds = Array.isArray(asset.nodes) ? asset.nodes : []
          assetNodeIds.forEach((node) => {
            const nodeId = typeof node === 'object' ? node?.id : node
            if (nodeId) {
              nodeIds.add(String(nodeId))
            }
          })
        })
      return [...nodeIds]
    },
    assetTreeTableDialogHandleCancel() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style scoped></style>
