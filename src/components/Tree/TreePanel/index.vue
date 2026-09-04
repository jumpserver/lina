<template>
  <div
    :class="[
      {
        'has-custom-header': $slots.header,
        'has-header-actions': showHeader && headerActions,
        'is-bordered': bordered,
        'is-fill-height': fillHeight
      },
      $attrs.class
    ]"
    :style="$attrs.style"
    class="tree-panel"
  >
    <div v-if="showHeader" class="tree-panel__header tree-view-header">
      <slot name="header">
        <i v-if="icon" :class="icon" aria-hidden="true" class="tree-panel__header-icon" />
        <span class="tree-panel__header-title">{{ title }}</span>
      </slot>
    </div>

    <component
      :is="component"
      v-bind="treeAttrs"
      ref="AutoDataZTree"
      :setting="setting"
      class="tree-panel__tree"
    >
      <template v-if="$slots['toolbar-prepend']" #toolbar-prepend="slotProps">
        <slot name="toolbar-prepend" v-bind="slotProps" />
      </template>
      <template v-if="$slots['tools-menu']" #tools-menu="slotProps">
        <slot name="tools-menu" v-bind="slotProps" />
      </template>
      <template v-if="$slots['node-icon']" #node-icon="slotProps">
        <slot name="node-icon" v-bind="slotProps" />
      </template>
      <template v-if="$slots['node-actions']" #node-actions="slotProps">
        <slot name="node-actions" v-bind="slotProps" />
      </template>
      <template v-if="$slots.rMenu" #rMenu="slotProps">
        <slot name="rMenu" v-bind="slotProps" />
      </template>
    </component>
  </div>
</template>

<script>
import XTree from '@/components/Tree/XTree/index.vue'

export default {
  name: 'TreePanel',
  components: { XTree },
  inheritAttrs: false,
  props: {
    component: {
      type: [String, Object],
      default: 'XTree'
    },
    setting: {
      type: Object,
      default: () => ({})
    },
    title: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: 'fa-solid fa-tree'
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    headerActions: {
      type: Boolean,
      default: true
    },
    bordered: {
      type: Boolean,
      default: false
    },
    fillHeight: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    treeAttrs() {
      const attrs = { ...this.$attrs }
      delete attrs.class
      delete attrs.style
      return attrs
    }
  },
  methods: {
    getTree() {
      return this.$refs.AutoDataZTree
    },
    hideRMenu() {
      return this.getTree()?.hideRMenu?.()
    },
    getSelectedNodes() {
      return this.getTree()?.getSelectedNodes?.() || []
    },
    getNodes() {
      return this.getTree()?.getNodes?.() || []
    },
    getAllNodes() {
      const tree = this.getTree()
      return tree?.getAllNodes?.() || tree?.getNodes?.() || []
    },
    getExpandedKeys() {
      return this.getTree()?.getExpandedKeys?.() || []
    },
    getNodePath(id) {
      return this.getTree()?.getNodePath?.(id) || []
    },
    setExpandedKeys(keys) {
      return this.getTree()?.setExpandedKeys?.(keys)
    },
    expandAll() {
      return this.getTree()?.expandAll?.()
    },
    collapseAll() {
      return this.getTree()?.collapseAll?.()
    },
    collapseStepwise() {
      return this.getTree()?.collapseStepwise?.()
    },
    expandToNode(id) {
      return this.getTree()?.expandToNode?.(id)
    },
    getTreeSnapshot() {
      return this.getTree()?.getTreeSnapshot?.()
    },
    selectNode(node) {
      return this.getTree()?.selectNode?.(node)
    },
    clearSelection() {
      return this.getTree()?.clearSelection?.()
    },
    refreshAssetRelationAmounts(nodeIds) {
      return this.getTree()?.refreshAssetRelationAmounts?.(nodeIds)
    },
    reloadVisibleMetrics(options) {
      return this.getTree()?.reloadVisibleMetrics?.(options)
    },
    invalidateNormalMetrics() {
      return this.getTree()?.invalidateNormalMetrics?.()
    },
    setNodeMetric(id, amount) {
      return this.getTree()?.setNodeMetric?.(id, amount)
    },
    setPermissionScope(scope) {
      return this.getTree()?.setPermissionScope?.(scope)
    },
    showOnlyNodes(nodeIds, options) {
      return this.getTree()?.showOnlyNodes?.(nodeIds, options)
    },
    restoreAllNodes() {
      return this.getTree()?.restoreAllNodes?.()
    }
  }
}
</script>

<style lang="scss" scoped>
.tree-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--el-bg-color, #fff);

  &.is-bordered {
    border: 1px solid var(--panel-border-color, var(--el-border-color));
    border-radius: var(--el-card-border-radius, 4px);
    overflow: hidden;
  }

  &.is-fill-height {
    height: 100%;
    min-height: 0;

    > .tree-panel__tree {
      flex: 1 1 auto;
      height: auto;
      min-height: 0;
    }
  }
}

.tree-panel__header {
  box-sizing: border-box;
  display: flex;
  flex: none;
  align-items: center;
  height: 40px;
  padding: 0 18px;
  background: var(--el-bg-color, #fff);
}

.tree-panel.has-header-actions .tree-panel__header {
  padding-right: 80px;
}

.tree-panel.has-custom-header .tree-panel__header {
  padding-left: 8px;
}

.tree-panel.has-custom-header.has-header-actions .tree-panel__header {
  padding-right: 48px;
}

.tree-panel__header-icon {
  flex: none;
  width: 14px;
  margin-right: 6px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  text-align: center;
}

.tree-panel__header-title {
  overflow: hidden;
  color: var(--el-text-color-primary);
  font-size: 13px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
