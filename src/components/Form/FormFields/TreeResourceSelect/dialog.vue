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
      <span>{{ $t('ResourceSelectSelectedCount', { count: selectedCount }) }}</span>
      <div class="tree-resource-select-dialog__toolbar-actions">
        <el-tooltip :content="selectedOnlyTitle" placement="top" :show-after="300">
          <el-button
            :aria-label="selectedOnlyTitle"
            :class="{ 'is-active': showSelectedOnly }"
            :disabled="selectedCount === 0 && !showSelectedOnly"
            class="tree-resource-select-dialog__toolbar-button tree-resource-select-dialog__selected-only"
            @click="toggleSelectedOnly"
          >
            <el-icon><View /></el-icon>
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
          v-model="searchValue"
          :placeholder="$t('Search')"
          class="tree-resource-select-dialog__search"
          clearable
          @input="applyTreeFilter"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
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
        :expand-on-click-node="true"
        :filter-node-method="filterNode"
        :props="treeProps"
        node-key="treeKey"
        show-checkbox
        @check="handleCheck"
      >
        <template #default="{ data }">
          <span class="tree-resource-select-dialog__node" :title="getNodeLabel(data)">
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
    initialSelectedOnly: {
      type: Boolean,
      default: false
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
    return {
      draftValue: [...this.value],
      searchValue: '',
      showSelectedOnly: this.initialSelectedOnly,
      loading: false,
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
    selectedOnlyTitle() {
      return this.showSelectedOnly
        ? this.$t('TreeResourceSelectShowAll')
        : this.$t('TreeResourceSelectShowSelected')
    }
  },
  mounted() {
    this.loadTree()
  },
  methods: {
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
        this.defaultExpandedKeys = this.treeData.map((node) => node.treeKey)
        await this.$nextTick()
        this.syncLoadedChecks()
        if (this.showSelectedOnly) {
          this.applyTreeFilter()
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
          return id !== undefined && id !== null && this.selectedIdSet.has(String(id))
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
      this.showSelectedOnly = !this.showSelectedOnly
      this.applyTreeFilter()
    },
    clearAllSelected() {
      this.draftValue = []
      this.$refs.tree?.setCheckedKeys([])
      if (this.showSelectedOnly) {
        this.showSelectedOnly = false
      }
      this.$nextTick(() => this.applyTreeFilter())
    },
    handleCheck(node, { checkedKeys }) {
      const id = this.getNodeId(node)
      if (id === undefined || id === null) {
        return
      }
      const treeKey = this.getTreeKey(node)
      const checked = checkedKeys.some((key) => String(key) === String(treeKey))
      const normalizedId = String(id)
      if (checked && !this.selectedIdSet.has(normalizedId)) {
        this.draftValue.push(id)
      } else if (!checked) {
        this.draftValue = this.draftValue.filter((item) => String(item) !== normalizedId)
      }
      if (this.showSelectedOnly) {
        this.$nextTick(() => this.applyTreeFilter())
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
      this.$emit('confirm', [...this.draftValue])
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
    display: inline-block;
    padding-right: 10px;
    color: var(--el-text-color-regular);
    font-size: 13px;
    white-space: nowrap;
  }
}
</style>
