<template>
  <div class="asset-select-dialog">
    <AssetDialog
      v-if="visible"
      :base-url="assetsUrl"
      :can-select="canSelectAsset"
      :confirm-title="confirmTitle"
      :confirm-type="confirmType"
      :danger-selection="dangerSelection"
      :initial-tree-amounts="dialogTreeAmounts"
      :initial-tree-asset-scope="dialogTreeAssetScope"
      :initial-tree-data="dialogTreeData"
      :plain-text-cells="true"
      :show-selected-items="true"
      :show-tree="showTree"
      :title="dialogTitle"
      :tree-setting="dialogTreeSetting"
      :visible="visible"
      @cancel="assetTreeTableDialogHandleCancel"
      @confirm="assetTreeTableDialogHandleConfirm"
      @update:visible="handleVisibleChange"
    />
  </div>
</template>

<script>
import AssetDialog from '@/components/Apps/AssetSelect/dialog.vue'

const ACTION_CONFIG = {
  add: {
    titleKey: 'AddAssetToNode',
    confirmKey: 'NodeAssetActionAdd',
    confirmType: 'primary',
    endpoint: 'add',
    showTree: true
  },
  move: {
    titleKey: 'MoveAssetToNode',
    confirmKey: 'NodeAssetActionMove',
    confirmType: 'primary',
    endpoint: 'replace',
    showTree: true
  },
  remove: {
    titleKey: 'RemoveAssetFromNode',
    confirmKey: 'NodeAssetActionRemove',
    confirmType: 'danger',
    endpoint: 'remove',
    showTree: false
  }
}

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
  computed: {
    actionConfig() {
      return ACTION_CONFIG[this.action]
    },
    dialogTitle() {
      const title = this.$t(this.actionConfig?.titleKey || 'AssetManagement')
      const nodeName = this.selectNode?.name || this.selectNode?.meta?.data?.value
      return nodeName ? `${title} - ${nodeName}` : title
    },
    confirmTitle() {
      return this.actionConfig?.confirmKey || 'Confirm'
    },
    confirmType() {
      return this.actionConfig?.confirmType || 'primary'
    },
    dangerSelection() {
      return this.action === 'remove'
    },
    assetsUrl() {
      if (this.action === 'remove') {
        return `/api/v1/assets/assets/?node_id=${encodeURIComponent(this.targetNodeId)}&show_current_asset=1`
      } else {
        return `/api/v1/assets/assets/`
      }
    },
    targetNodeId() {
      return this.selectNode?.meta?.data?.id || this.selectNode?.id || ''
    },
    dialogTreeSetting() {
      return {
        operationNodeId: this.targetNodeId
      }
    },
    dialogTreeSnapshot() {
      if (!this.showTree) {
        return null
      }
      const snapshot = this.tree?.getTreeSnapshot?.()
      const nodes = snapshot?.nodes || this.tree?.getAllNodes?.()
      if (!Array.isArray(nodes) || nodes.length === 0) {
        return null
      }
      if (nodes[0]?.meta?.type !== 'node') {
        return null
      }
      return {
        nodes,
        amounts: snapshot?.amounts || {},
        assetScope: snapshot?.assetScope ?? ''
      }
    },
    dialogTreeData() {
      return this.dialogTreeSnapshot?.nodes || []
    },
    dialogTreeAmounts() {
      return this.dialogTreeSnapshot?.amounts || {}
    },
    dialogTreeAssetScope() {
      return this.dialogTreeSnapshot?.assetScope ?? ''
    },
    showTree() {
      return this.actionConfig?.showTree !== false
    },
    targetNodeScopeIds() {
      const targetNodeId = String(this.targetNodeId)
      const nodeIds = new Set(targetNodeId ? [targetNodeId] : [])
      let assetTree = this.tree
      for (let depth = 0; depth < 3; depth += 1) {
        const innerTree = assetTree?.$refs?.AutoDataZTree
        if (!innerTree || innerTree === assetTree) {
          break
        }
        assetTree = innerTree
      }
      if (!targetNodeId || assetTree?.assetScope === '1') {
        return nodeIds
      }

      const roots = Array.isArray(assetTree?.normalTreeData) ? assetTree.normalTreeData : []
      const pending = [...roots]
      let targetNode = null
      while (pending.length) {
        const node = pending.pop()
        if (String(node?.meta?.data?.id || '') === targetNodeId) {
          targetNode = node
          break
        }
        pending.push(...(node?.children || []))
      }

      if (!targetNode) {
        return nodeIds
      }
      const descendants = [targetNode]
      while (descendants.length) {
        const node = descendants.pop()
        const nodeId = node?.meta?.data?.id
        if (nodeId) {
          nodeIds.add(String(nodeId))
        }
        descendants.push(...(node?.children || []))
      }
      return nodeIds
    }
  },
  methods: {
    canSelectAsset(asset) {
      if (this.action !== 'add') {
        return true
      }
      return !this.getAssetNodeIds(asset).some((nodeId) =>
        this.targetNodeScopeIds.has(String(nodeId))
      )
    },
    getAssetNodeIds(asset) {
      const nodes = Array.isArray(asset?.nodes) ? asset.nodes : []
      return nodes
        .map((node) => (typeof node === 'object' ? node?.id || node?.pk : node))
        .filter((nodeId) => nodeId !== undefined && nodeId !== null && nodeId !== '')
    },
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
      const endpoint = this.actionConfig?.endpoint
      if (!endpoint) {
        return
      }
      const url = `/api/v1/assets/nodes/${currentNode.meta.data.id}/assets/${endpoint}/`
      this.$axios
        .put(url, { assets: assetsSelected })
        .then(() => {
          this.tree?.refreshAssetRelationAmounts?.(affectedNodeIds)
          this.$emit('hide-menu')
          this.$emit('update:visible', false)
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
          this.getAssetNodeIds(asset).forEach((nodeId) => {
            nodeIds.add(String(nodeId))
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
