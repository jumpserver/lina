<template>
  <div
    :class="{
      'is-domain-tree': isDomainTree,
      'is-fill-height': treePanelFillHeight,
      'is-x-tree': isModernTree
    }"
    class="tree-tab"
  >
    <transition appear mode="out-in" name="fade-transform" @after-enter="handleActiveTreeReady">
      <slot>
        <keep-alive v-if="flag">
          <TreePanel
            :key="componentKey"
            ref="AutoDataZTree"
            :component="activeTreeComponent"
            :fill-height="treePanelFillHeight"
            :header-actions="isModernTree"
            :setting="activeTreeSetting"
            :show-header="tabIndices.length > 0"
            @tree-init-finish="$emit('tree-init-finish', $event)"
            @url-change="handleUrlChange"
            v-on="forwardedTreeEventListeners"
          >
            <template #header>
              <el-dropdown
                :disabled="!hasMultipleTreeViews"
                :hide-timeout="160"
                placement="bottom-start"
                popper-class="tree-view-popper"
                :show-timeout="80"
                :teleported="viewMenuTeleported"
                trigger="hover"
                @command="handleTreeViewChange"
                @visible-change="treeViewDropdownVisible = $event"
              >
                <button
                  :class="{
                    'is-open': treeViewDropdownVisible,
                    'is-static': !hasMultipleTreeViews
                  }"
                  class="tree-view-selector"
                  :disabled="!hasMultipleTreeViews"
                  type="button"
                >
                  <i
                    v-if="activeTreeItem?.icon"
                    :class="activeTreeItem.icon"
                    aria-hidden="true"
                    class="tree-view-selector__icon"
                  />
                  <span class="tree-view-selector__label">{{ activeTreeItem?.title }}</span>
                  <el-icon v-if="hasMultipleTreeViews" class="tree-view-selector__arrow">
                    <ArrowDown />
                  </el-icon>
                </button>
                <template #dropdown>
                  <el-dropdown-menu class="tree-view-menu">
                    <el-dropdown-item
                      v-for="item in tabIndices"
                      :key="item.name"
                      :class="{ 'is-active': item.name === iActiveMenu }"
                      :command="item.name"
                      :disabled="item.disabled"
                    >
                      <i
                        v-if="item.icon"
                        :class="item.icon"
                        aria-hidden="true"
                        class="tree-view-menu__icon"
                      />
                      <span class="tree-view-menu__label">{{ item.title }}</span>
                      <slot :tab="item.name" name="badge" />
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
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
            <template #rMenu="slotProps">
              <div>
                <slot name="rMenu" v-bind="slotProps" />
              </div>
            </template>
          </TreePanel>
        </keep-alive>
      </slot>
    </transition>
  </div>
</template>

<script>
import AutoDataZTree from '@/components/Tree/AutoDataZTree/index.vue'
import NodeAssetTree from '@/components/Tree/NodeAssetTree/index.vue'
import TreePanel from '@/components/Tree/TreePanel/index.vue'
import UserTree from '@/components/Tree/UserTree/index.vue'
import XTree from '@/components/Tree/XTree/index.vue'

const ACTIVE_TREE_TAB_KEY = 'activeTreeTab'
const TREE_COMPONENTS = Object.freeze({ AutoDataZTree, NodeAssetTree, UserTree, XTree })
const FORWARDED_TREE_EVENTS = Object.freeze([
  'children-truncated',
  'metric-change',
  'permission-scope-change',
  'search-state-change',
  'select',
  'selected',
  'selection-clear',
  'sort-change'
])

export default {
  name: 'TabTree',
  components: { TreePanel },
  emits: [
    'active-tree-ready',
    'children-truncated',
    'metric-change',
    'permission-scope-change',
    'search-state-change',
    'select',
    'selected',
    'selection-clear',
    'sort-change',
    'tab-click',
    'tree-init-finish',
    'update:activeMenu',
    'urlChange'
  ],
  props: {
    submenu: {
      type: Array,
      default: () => []
    },
    activeMenu: {
      type: String,
      required: true
    },
    fillHeight: {
      type: Boolean,
      default: false
    },
    treeComponent: {
      type: String,
      default: 'XTree'
    },
    viewMenuTeleported: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      flag: false,
      componentKey: 1,
      activeTreeName: '',
      activeTreeSetting: {},
      treeViewDropdownVisible: false
    }
  },
  computed: {
    iActiveMenu: {
      get() {
        return this.activeMenu
      },
      set(item) {
        this.$emit('update:activeMenu', item)
      }
    },
    tabIndices() {
      return this.submenu.filter((item) => {
        const hidden = typeof item.hidden === 'function' ? item.hidden() : item.hidden
        return !hidden
      })
    },
    activeTreeItem() {
      return this.tabIndices.find((item) => item.name === this.iActiveMenu) || this.tabIndices[0]
    },
    hasMultipleTreeViews() {
      return this.tabIndices.length > 1
    },
    activeTreeComponentName() {
      return this.activeTreeItem?.treeComponent || this.treeComponent
    },
    activeTreeComponent() {
      return TREE_COMPONENTS[this.activeTreeComponentName] || this.activeTreeComponentName
    },
    isModernTree() {
      return ['XTree', 'NodeAssetTree', 'UserTree'].includes(this.activeTreeComponentName)
    },
    isDomainTree() {
      return ['NodeAssetTree', 'UserTree'].includes(this.activeTreeComponentName)
    },
    treePanelFillHeight() {
      return this.fillHeight || (this.isModernTree && this.activeTreeSetting.fillHeight !== false)
    },
    forwardedTreeEventListeners() {
      // Vue component events do not bubble through dynamic component wrappers.
      // Forward only the public tree contract; callbacks remain owned by the
      // child setting and are not invoked again here.
      return Object.fromEntries(
        FORWARDED_TREE_EVENTS.map((event) => [event, (...args) => this.$emit(event, ...args)])
      )
    }
  },
  watch: {
    activeMenu(val) {
      this.changeTreeSetting(val)
    }
  },
  async mounted() {
    const activeMenu = await this.getPropActiveTab()
    if (activeMenu !== this.activeMenu) {
      this.$emit('update:activeMenu', activeMenu)
    }
    this.changeTreeSetting(activeMenu)
  },
  methods: {
    getTree() {
      const tree = this.$refs.AutoDataZTree
      return tree?.getTree?.() || tree
    },
    handleActiveTreeReady() {
      this.$nextTick(() => {
        const tree = this.getTree()
        if (!tree) {
          return
        }
        this.$emit('active-tree-ready', {
          item: this.activeTreeItem,
          name: this.iActiveMenu,
          tree
        })
      })
    },
    hideRMenu() {
      return this.$refs.AutoDataZTree?.hideRMenu?.()
    },
    getSelectedNodes: function () {
      return this.$refs.AutoDataZTree?.getSelectedNodes?.() || []
    },
    getNodes: function () {
      return this.$refs.AutoDataZTree?.getNodes?.() || []
    },
    getAllNodes: function () {
      const tree = this.$refs.AutoDataZTree
      return tree?.getAllNodes?.() || tree?.getNodes?.() || []
    },
    getExpandedKeys() {
      return this.$refs.AutoDataZTree?.getExpandedKeys?.() || []
    },
    getNodePath(id) {
      return this.$refs.AutoDataZTree?.getNodePath?.(id) || []
    },
    setExpandedKeys(keys) {
      return this.$refs.AutoDataZTree?.setExpandedKeys?.(keys)
    },
    expandAll() {
      return this.$refs.AutoDataZTree?.expandAll?.()
    },
    collapseAll() {
      return this.$refs.AutoDataZTree?.collapseAll?.()
    },
    collapseStepwise() {
      return this.$refs.AutoDataZTree?.collapseStepwise?.()
    },
    expandToNode(id) {
      return this.$refs.AutoDataZTree?.expandToNode?.(id)
    },
    getTreeSnapshot: function () {
      return this.$refs.AutoDataZTree?.getTreeSnapshot?.()
    },
    selectNode: function (node) {
      return this.$refs.AutoDataZTree?.selectNode?.(node)
    },
    clearSelection() {
      return this.$refs.AutoDataZTree?.clearSelection?.()
    },
    restoreAllNodes() {
      return this.$refs.AutoDataZTree?.restoreAllNodes?.()
    },
    showOnlyNodes(nodeIds, options) {
      return this.$refs.AutoDataZTree?.showOnlyNodes?.(nodeIds, options)
    },
    refreshAssetRelationAmounts(nodeIds) {
      return this.$refs.AutoDataZTree?.refreshAssetRelationAmounts?.(nodeIds)
    },
    reloadVisibleMetrics(options) {
      return this.$refs.AutoDataZTree?.reloadVisibleMetrics?.(options)
    },
    invalidateNormalMetrics() {
      return this.$refs.AutoDataZTree?.invalidateNormalMetrics?.()
    },
    setNodeMetric(id, amount) {
      return this.$refs.AutoDataZTree?.setNodeMetric?.(id, amount)
    },
    setPermissionScope(scope) {
      return this.$refs.AutoDataZTree?.setPermissionScope?.(scope)
    },
    handleUrlChange(url) {
      this.$emit('urlChange', url)
    },
    handleTreeViewChange(treeName) {
      const tree = this.tabIndices.find((item) => item.name === treeName)
      if (!tree || tree.disabled || tree.name === this.iActiveMenu) {
        return
      }
      this.iActiveMenu = tree.name
      this.handleTabClick(tree)
    },
    handleTabClick(tab) {
      this.$emit('tab-click', tab)
      this.$cookie.set(ACTIVE_TREE_TAB_KEY, tab.name, 1)

      if (this.$route?.query?.[ACTIVE_TREE_TAB_KEY]) {
        this.$router.push({
          query: {
            ...this.$route.query,
            [ACTIVE_TREE_TAB_KEY]: ''
          }
        })
      }
    },
    changeTreeSetting(tabName) {
      const tab = this.submenu.find((item) => item.name === tabName)
      if (!tab) {
        return
      }
      if (
        this.flag &&
        this.activeTreeName === tabName &&
        this.activeTreeSetting === tab.treeSetting
      ) {
        return
      }

      this.activeTreeName = tabName
      this.activeTreeSetting = tab.treeSetting
      // Keep the key stable for each tab so keep-alive can restore the same
      // tree instance, including its data, expanded nodes and search state.
      this.componentKey = `${this.$route.name || 'tree'}_${tabName}`
      this.flag = true
    },
    getPropActiveTab() {
      const preActiveTabs = [
        this.$route.query[ACTIVE_TREE_TAB_KEY],
        this.$cookie.get(ACTIVE_TREE_TAB_KEY),
        this.activeMenu
      ]

      for (const preTab of preActiveTabs) {
        const currentTab = typeof preTab === 'object' ? preTab?.name : preTab
        for (const tabName of this.tabIndices) {
          const currentTabName = tabName?.name || ''
          if (currentTab?.toLowerCase() === currentTabName?.toLowerCase()) {
            return currentTabName
          }
        }
      }

      return this.tabIndices[0]?.name || this.activeMenu || ''
    }
  }
}
</script>

<style lang="scss" scoped>
.tree-tab {
  position: relative;
}

.tree-tab.is-fill-height {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;

  > .tree-panel {
    flex: 1 1 auto;
    min-height: 0;
  }
}

.tree-tab.is-domain-tree {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;

  > .tree-panel {
    flex: none;
  }

  > .tree-panel.is-fill-height {
    flex: 1 1 auto;
    min-height: 0;
  }
}

.tree-view-selector {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  height: 30px;
  min-width: 0;
  padding: 0 10px;
  border: 0;
  border-radius: 5px;
  color: var(--el-text-color-primary);
  background: transparent;
  cursor: pointer;
  transition:
    color 0.15s ease,
    background-color 0.15s ease;

  &:not(.is-static):hover,
  &:not(.is-static):focus-visible {
    outline: none;
    color: var(--el-text-color-primary);
    background: rgba(0, 0, 0, 0.05);
  }

  &.is-static {
    cursor: default;
  }
}

.tree-view-selector__label {
  overflow: hidden;
  font-size: 13px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-view-selector__icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 14px;
  margin-right: 6px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.tree-view-selector__arrow {
  flex: none;
  margin-left: 5px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  transition: transform 0.15s ease;
}

.tree-view-selector.is-open .tree-view-selector__arrow {
  transform: rotate(180deg);
}

:deep(.data-z-tree) {
  padding: 0;
}

:deep(.ztree) {
  padding: 0;
}
</style>

<style lang="scss">
.tree-view-popper.el-popper {
  box-sizing: border-box;
  min-width: 132px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
}

.tree-view-popper .tree-view-menu {
  padding: 4px;
  border-radius: 5px;
}

.tree-view-popper .el-dropdown-menu__item {
  display: flex;
  align-items: center;
  min-height: 32px;
  padding: 0 10px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 400;
  color: var(--el-text-color-regular);
}

.tree-view-popper .el-dropdown-menu__item.is-active {
  color: var(--el-text-color-regular);
  background: transparent;
}

.tree-view-popper .el-dropdown-menu__item:not(.is-disabled):hover,
.tree-view-popper .el-dropdown-menu__item:not(.is-disabled):focus {
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
}

.tree-view-menu__label {
  flex: 1;
  min-width: 0;
}

.tree-view-menu__icon {
  flex: none;
  width: 14px;
  margin-right: 12px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  text-align: center;
}

.tree-view-popper .el-dropdown-menu__item.is-active .tree-view-menu__label {
  color: var(--el-color-primary);
  font-weight: 500;
}
</style>
