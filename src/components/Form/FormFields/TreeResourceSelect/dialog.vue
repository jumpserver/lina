<template>
  <Dialog
    :close-on-click-modal="false"
    :title="$t('ResourceSelectDialogTitle', { resource: displayResourceName })"
    :visible="visible"
    class="tree-resource-select-dialog"
    max-width="560px"
    top="8vh"
    width="560px"
    @cancel="handleCancel"
    @confirm="handleConfirm"
    @update:visible="handleVisibleChange"
  >
    <div class="tree-resource-select-dialog__toolbar">
      <span>{{
        $t('ResourceSelectSelectedCount', {
          count: selectedCount,
          resource: displayResourceName
        })
      }}</span>
      <div class="tree-resource-select-dialog__toolbar-actions">
        <el-tooltip :content="selectedOnlyTitle" placement="top" :show-after="300">
          <el-button
            :aria-label="selectedOnlyTitle"
            :class="{ 'is-active': showSelectedOnly }"
            :disabled="selectedCount === 0 && !showSelectedOnly"
            class="tree-resource-select-dialog__toolbar-button tree-resource-select-dialog__selected-only"
            @click="toggleSelectedOnly"
          >
            <svg-icon icon-class="filter" />
          </el-button>
        </el-tooltip>
        <el-tooltip :content="expandTitle" placement="top" :show-after="300">
          <el-button
            :aria-label="expandTitle"
            :disabled="loading || treeData.length === 0"
            class="tree-resource-select-dialog__toolbar-button"
            @click="setTreeExpanded(true)"
          >
            <svg-icon v-if="expandAllNext" icon-class="tree-expand-all" />
            <el-icon v-else><Aim /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip
          :content="$t('TreeResourceSelectCollapseAll')"
          placement="top"
          :show-after="300"
        >
          <el-button
            :aria-label="$t('TreeResourceSelectCollapseAll')"
            :disabled="loading || treeData.length === 0"
            class="tree-resource-select-dialog__toolbar-button"
            @click="setTreeExpanded(false)"
          >
            <svg-icon icon-class="tree-collapse-all" />
          </el-button>
        </el-tooltip>
        <el-tooltip
          :content="$t('TreeResourceSelectClearSelected')"
          placement="top"
          :show-after="300"
        >
          <el-button
            :aria-label="$t('TreeResourceSelectClearSelected')"
            :disabled="selectedCount === 0"
            class="tree-resource-select-dialog__toolbar-button tree-resource-select-dialog__clear-selected"
            @click="clearAllSelected"
          >
            <el-icon class="tree-resource-select-dialog__clear-icon"><Brush /></el-icon>
          </el-button>
        </el-tooltip>
        <el-input
          ref="searchInput"
          v-model="searchValue"
          :placeholder="$t('Search')"
          class="tree-resource-select-dialog__search"
          clearable
          @blur="searchFocused = false"
          @focus="searchFocused = true"
          @input="applyTreeFilter"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #suffix>
            <span v-if="!searchFocused" class="tree-resource-select-dialog__search-shortcut"
              >/</span
            >
          </template>
        </el-input>
      </div>
    </div>

    <div v-loading="loading" class="tree-resource-select-dialog__tree">
      <el-tree
        ref="tree"
        :check-strictly="true"
        :data="treeData"
        :default-expanded-keys="defaultExpandedKeys"
        :expand-on-click-node="false"
        :filter-node-method="filterNode"
        :props="treeProps"
        node-key="treeKey"
        show-checkbox
        @check="handleCheck"
        @node-click="handleNodeClick"
      >
        <template #default="{ data }">
          <span
            class="tree-resource-select-dialog__node"
            :title="getNodeLabel(data)"
            @click.stop="toggleNodeChecked(data)"
          >
            {{ getNodeLabel(data) }}
          </span>
        </template>
      </el-tree>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'

export default {
  name: 'TreeResourceSelectDialog',
  components: { Dialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    value: {
      type: Array,
      default: () => []
    },
    selectedResources: {
      type: Array,
      default: () => []
    },
    treeUrl: {
      type: String,
      required: true
    },
    resourceName: {
      type: String,
      default: ''
    },
    valueKey: {
      type: String,
      default: 'id'
    },
    queryParams: {
      type: [Object, Function],
      default: () => ({})
    }
  },
  emits: ['cancel', 'confirm', 'update:visible'],
  data() {
    const resourceCache = new Map()
    this.selectedResources.forEach((item) => {
      const id = item?.[this.valueKey] ?? item?.value ?? item?.id
      const name = String(item?.name || '').trim()
      if (id !== undefined && id !== null && id !== '' && name) {
        resourceCache.set(String(id), { value: id, name })
      }
    })
    return {
      draftValue: [...this.value],
      searchValue: '',
      searchFocused: false,
      showSelectedOnly: false,
      selectedOnlyIds: [],
      expandAllNext: false,
      loading: false,
      resourceCache,
      treeData: [],
      defaultExpandedKeys: [],
      treeProps: {
        label: 'name',
        children: 'children'
      }
    }
  },
  computed: {
    displayResourceName() {
      return this.resourceName || this.$t('Nodes')
    },
    selectedCount() {
      return this.draftValue.length
    },
    selectedIdSet() {
      return new Set(this.draftValue.map((id) => String(id)))
    },
    selectedOnlyIdSet() {
      return new Set(this.selectedOnlyIds.map((id) => String(id)))
    },
    selectedOnlyTitle() {
      return this.showSelectedOnly
        ? this.$t('TreeResourceSelectShowAll')
        : this.$t('TreeResourceSelectShowSelected')
    },
    expandTitle() {
      return this.expandAllNext
        ? this.$t('NodeFilterExpandAll')
        : this.$t('TreeResourceSelectExpandSelected')
    }
  },
  mounted() {
    document.addEventListener('keydown', this.handleDialogShortcut)
    this.loadTree()
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleDialogShortcut)
  },
  methods: {
    cacheTreeResources(nodes) {
      nodes.forEach((node) => {
        const id = this.getNodeId(node)
        const name = String(this.getNodeLabel(node) || '').trim()
        if (id !== undefined && id !== null && id !== '' && name) {
          this.resourceCache.set(String(id), { value: id, name })
        }
        this.cacheTreeResources(node.children || [])
      })
    },
    getSelectedResources() {
      return this.draftValue.map((id) => this.resourceCache.get(String(id))).filter(Boolean)
    },
    handleDialogShortcut(event) {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.repeat ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      ) {
        return
      }
      const target = event.target
      if (
        event.key !== '/' ||
        target?.closest?.('input, textarea, select, [contenteditable="true"]')
      ) {
        return
      }

      event.preventDefault()
      this.$refs.searchInput?.focus()
    },
    getQueryParams() {
      const params = typeof this.queryParams === 'function' ? this.queryParams() : this.queryParams
      return { ...(params || {}) }
    },
    getTreeKey(node) {
      return node?.treeKey ?? node?.meta?.data?.key ?? node?.key ?? node?.id
    },
    getNodeId(node) {
      return (
        node?.resourceId ??
        node?.meta?.data?.[this.valueKey] ??
        node?.nodeId ??
        node?.[this.valueKey] ??
        node?.id
      )
    },
    getNodeLabel(node) {
      return (
        node?.name ||
        node?.full_value ||
        node?.meta?.data?.full_value ||
        node?.meta?.data?.value ||
        ''
      )
    },
    getParentTreeKey(node) {
      return node?.pId ?? node?.parent_key ?? node?.meta?.data?.parent_key
    },
    normalizeTreeNode(node, children = []) {
      return {
        ...node,
        treeKey: this.getTreeKey(node),
        resourceId: this.getNodeId(node),
        name: this.getNodeLabel(node),
        children
      }
    },
    buildTree(response) {
      const nodes = Array.isArray(response) ? response : response?.results || []
      const hasNestedChildren = nodes.some(
        (node) => Array.isArray(node.children) && node.children.length > 0
      )
      if (hasNestedChildren) {
        const normalizeNestedNodes = (items) =>
          items.map((node) =>
            this.normalizeTreeNode(node, normalizeNestedNodes(node.children || []))
          )
        return normalizeNestedNodes(nodes)
      }

      const treeNodes = nodes.map((node) => this.normalizeTreeNode(node))
      const nodeMap = new Map()
      treeNodes.forEach((node) => {
        if (node.treeKey !== undefined && node.treeKey !== null && node.treeKey !== '') {
          nodeMap.set(String(node.treeKey), node)
        }
      })

      const roots = []
      treeNodes.forEach((node) => {
        const parentKey = this.getParentTreeKey(node)
        const parent =
          parentKey === undefined || parentKey === null || parentKey === ''
            ? null
            : nodeMap.get(String(parentKey))
        if (parent && parent !== node) {
          parent.children.push(node)
        } else {
          roots.push(node)
        }
      })
      return roots
    },
    async loadTree() {
      if (this.loading || this.treeData.length > 0) {
        return
      }
      this.loading = true
      try {
        const response = await this.$axios.get(this.treeUrl, {
          params: this.getQueryParams()
        })
        this.treeData = this.buildTree(response)
        this.cacheTreeResources(this.treeData)
        // 默认展开一级根；若有已选节点，再展开其祖先路径，避免嵌套二三级时看不到勾选
        const firstLevelKeys = this.treeData
          .filter((node) => node.children?.length)
          .map((node) => node.treeKey)
        const selectedAncestorKeys = this.getSelectedAncestorKeys()
        this.defaultExpandedKeys = [...new Set([...firstLevelKeys, ...selectedAncestorKeys])]
        await this.$nextTick()
        this.syncLoadedChecks()
        if (this.showSelectedOnly) {
          this.applyTreeFilter()
        } else {
          this.applyDefaultExpandedState()
        }
      } catch (error) {
        this.treeData = []
      } finally {
        this.loading = false
      }
    },
    syncLoadedChecks() {
      const tree = this.$refs.tree
      if (!tree) {
        return
      }
      const checkedTreeKeys = []
      const sync = (nodes) => {
        nodes.forEach((node) => {
          const id = this.getNodeId(node)
          if (id !== undefined && id !== null && this.selectedIdSet.has(String(id))) {
            checkedTreeKeys.push(node.treeKey)
          }
          sync(node.children || [])
        })
      }
      sync(this.treeData)
      tree.setCheckedKeys(checkedTreeKeys)
    },
    getSelectedAncestorKeys() {
      const expandedKeys = []
      const visit = (node) => {
        let childSelected = false
        const children = node.children || []
        children.forEach((child) => {
          if (visit(child)) {
            childSelected = true
          }
        })
        if (childSelected) {
          expandedKeys.push(node.treeKey)
        }
        const id = this.getNodeId(node)
        const currentSelected =
          id !== undefined && id !== null && this.selectedIdSet.has(String(id))
        return currentSelected || childSelected
      }
      this.treeData.forEach((node) => visit(node))
      return expandedKeys
    },
    applyDefaultExpandedState() {
      const tree = this.$refs.tree
      if (!tree) {
        return
      }
      const expandedKeys = new Set(this.defaultExpandedKeys.map((key) => String(key)))
      const visit = (nodes) => {
        nodes.forEach((node) => {
          const treeNode = tree.getNode(node.treeKey)
          if (treeNode && node.children?.length) {
            if (expandedKeys.has(String(node.treeKey))) {
              treeNode.expand()
            } else {
              treeNode.collapse()
            }
          }
          visit(node.children || [])
        })
      }
      visit(this.treeData)
    },
    getPathKeySet(predicate) {
      const visibleKeys = new Set()
      const visit = (node) => {
        let childVisible = false
        const children = node.children || []
        children.forEach((child) => {
          if (visit(child)) {
            childVisible = true
          }
        })
        const currentVisible = predicate(node)
        if (currentVisible || childVisible) {
          visibleKeys.add(String(this.getTreeKey(node)))
          return true
        }
        return false
      }
      this.treeData.forEach((node) => visit(node))
      return visibleKeys
    },
    getTreeFilterKeys() {
      let visibleKeys = null
      if (this.showSelectedOnly) {
        visibleKeys = this.getPathKeySet((node) => {
          const id = this.getNodeId(node)
          return id !== undefined && id !== null && this.selectedOnlyIdSet.has(String(id))
        })
      }

      const keyword = this.searchValue.trim().toLowerCase()
      if (keyword) {
        const searchKeys = this.getPathKeySet((node) =>
          this.getNodeLabel(node).toLowerCase().includes(keyword)
        )
        visibleKeys =
          visibleKeys === null
            ? searchKeys
            : new Set([...visibleKeys].filter((key) => searchKeys.has(key)))
      }
      return visibleKeys
    },
    applyTreeFilter() {
      const tree = this.$refs.tree
      if (!tree) {
        return
      }
      const visibleKeys = this.getTreeFilterKeys()
      tree.filter(visibleKeys)
      if (visibleKeys) {
        this.$nextTick(() => {
          visibleKeys.forEach((key) => {
            const node = tree.getNode(key)
            if (node?.childNodes?.length) {
              node.expand()
            }
          })
        })
      }
    },
    toggleSelectedOnly() {
      const showSelectedOnly = !this.showSelectedOnly
      this.selectedOnlyIds = showSelectedOnly ? [...this.draftValue] : []
      this.showSelectedOnly = showSelectedOnly
      this.expandAllNext = false
      this.applyTreeFilter()
    },
    setTreeExpanded(expanded) {
      const tree = this.$refs.tree
      if (!tree) {
        return
      }

      const expandableNodes = []
      const visit = (nodes) => {
        nodes.forEach((node) => {
          if (!node.children?.length) {
            return
          }
          expandableNodes.push(node)
          visit(node.children)
        })
      }
      visit(this.treeData)

      if (!expanded) {
        const firstLevelExpandedKeys = new Set(
          this.treeData.filter((node) => node.children?.length).map((node) => String(node.treeKey))
        )
        const isFirstLevelState = expandableNodes.every((node) => {
          const treeNode = tree.getNode(node.treeKey)
          return Boolean(treeNode?.expanded) === firstLevelExpandedKeys.has(String(node.treeKey))
        })
        const allCollapsed = expandableNodes.every((node) => !tree.getNode(node.treeKey)?.expanded)
        if (allCollapsed) {
          return
        }

        const restoreFirstLevelState = !isFirstLevelState
        expandableNodes.forEach((node) => {
          const treeNode = tree.getNode(node.treeKey)
          const shouldExpand =
            restoreFirstLevelState && firstLevelExpandedKeys.has(String(node.treeKey))
          if (shouldExpand) {
            treeNode?.expand()
          } else {
            treeNode?.collapse()
          }
        })
        this.expandAllNext = false
        return
      }

      if (this.expandAllNext) {
        expandableNodes.forEach((node) => tree.getNode(node.treeKey)?.expand())
        this.expandAllNext = false
        return
      }

      const selectedExpandedKeys = this.getSelectedAncestorKeys()
      const selectedExpandedKeySet = new Set(selectedExpandedKeys.map((key) => String(key)))
      this.defaultExpandedKeys = selectedExpandedKeys
      expandableNodes.forEach((node) => {
        const treeNode = tree.getNode(node.treeKey)
        if (selectedExpandedKeySet.has(String(node.treeKey))) {
          treeNode?.expand()
        } else {
          treeNode?.collapse()
        }
      })
      this.expandAllNext = true
    },
    clearAllSelected() {
      this.draftValue = []
      this.expandAllNext = false
      this.$refs.tree?.setCheckedKeys([])
      if (this.showSelectedOnly) {
        this.selectedOnlyIds = []
        this.showSelectedOnly = false
      }
      this.$nextTick(() => this.applyTreeFilter())
    },
    updateNodeChecked(node, checked) {
      const id = this.getNodeId(node)
      if (id === undefined || id === null) {
        return
      }
      const normalizedId = String(id)
      if (checked && !this.selectedIdSet.has(normalizedId)) {
        this.draftValue.push(id)
      } else if (!checked) {
        this.draftValue = this.draftValue.filter((item) => String(item) !== normalizedId)
      }
      this.expandAllNext = false
      if (this.showSelectedOnly) {
        this.$nextTick(() => this.applyTreeFilter())
      }
    },
    handleCheck(node, { checkedKeys }) {
      const treeKey = this.getTreeKey(node)
      const checked = checkedKeys.some((key) => String(key) === String(treeKey))
      this.updateNodeChecked(node, checked)
    },
    toggleNodeChecked(node) {
      const tree = this.$refs.tree
      const treeKey = this.getTreeKey(node)
      const treeNode = tree?.getNode(treeKey)
      if (!treeNode) {
        return
      }
      const checked = !treeNode.checked
      tree.setChecked(treeKey, checked, false)
      this.updateNodeChecked(node, checked)
    },
    handleNodeClick(node, treeNode, component, event) {
      if (
        !treeNode?.childNodes?.length ||
        event?.target?.closest?.('.el-checkbox, .tree-resource-select-dialog__node')
      ) {
        return
      }
      if (treeNode.expanded) {
        treeNode.collapse()
      } else {
        treeNode.expand()
      }
    },
    filterNode(visibleKeys, data) {
      if (visibleKeys === null) {
        return true
      }
      return visibleKeys.has(String(this.getTreeKey(data)))
    },
    handleVisibleChange(value) {
      this.$emit('update:visible', value)
    },
    handleConfirm() {
      this.$emit('confirm', [...this.draftValue], this.getSelectedResources())
      this.$emit('update:visible', false)
    },
    handleCancel() {
      this.$emit('cancel')
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss">
.tree-resource-select-dialog.el-dialog {
  height: min(680px, 82vh);
  display: flex;
  flex-direction: column;

  .el-dialog__body {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  .el-dialog__body > div {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  .tree-resource-select-dialog__toolbar {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 12px;
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }

  .tree-resource-select-dialog__search {
    flex: 0 1 210px;
    box-sizing: border-box;
    width: 210px;
    min-width: 140px;
    max-width: 210px;
    height: 30px;
    overflow: hidden;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background: #fff;
    font-size: 13px;

    .el-input__wrapper {
      height: 28px;
      min-height: 28px;
      padding: 0 9px;
      border: 0;
      border-radius: 3px;
      box-shadow: none;
    }

    .el-input__inner {
      height: 28px;
      font-size: 13px;
      line-height: 28px;
    }

    .el-input__prefix {
      color: var(--color-icon-primary);
    }

    .tree-resource-select-dialog__search-shortcut {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 4px;
      border: 1px solid #afb8c133;
      border-radius: 5px;
      background: var(--bgColor-muted, #f6f8fa);
      box-shadow: inset 0 -1px 0 #afb8c133;
      color: var(--color-text-primary);
      font-size: 11px;
      line-height: 16px;
    }
  }

  .tree-resource-select-dialog__toolbar-actions {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    min-width: 0;
  }

  .tree-resource-select-dialog__toolbar-button.el-button {
    width: 30px;
    height: 30px;
    margin: 0;
    padding: 0;
    border-color: var(--color-border);
    border-radius: 4px;
    background: #fff;
    color: var(--el-text-color-secondary);

    .el-icon {
      width: 13px;
      height: 13px;
      font-size: 13px;
    }

    .svg-icon {
      width: 14px;
      height: 14px;
    }

    &:hover:not(.is-disabled),
    &.is-active {
      border-color: var(--el-color-primary-light-5);
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }
  }

  .tree-resource-select-dialog__clear-selected.el-button:hover:not(.is-disabled) {
    border-color: var(--el-color-danger-light-5);
    background: var(--el-color-danger-light-9);
    color: var(--el-color-danger);
  }

  .tree-resource-select-dialog__clear-icon {
    transform: rotate(180deg);
  }

  .tree-resource-select-dialog__tree {
    flex: 1 1 auto;
    min-height: 0;
    min-width: 0;
    overflow: auto;
    overscroll-behavior: contain;
    padding: 8px 10px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;

    .el-tree {
      width: max-content;
      min-width: 100%;
    }
  }

  .tree-resource-select-dialog__node {
    display: inline-flex;
    flex: 1 0 auto;
    align-self: stretch;
    align-items: center;
    min-width: max-content;
    padding-right: 10px;
    color: var(--el-text-color-regular);
    cursor: pointer;
    font-size: 13px;
    white-space: nowrap;
  }
}
</style>
