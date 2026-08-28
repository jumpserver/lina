<template>
  <div :class="{ 'is-x-tree': treeComponent === 'XTree' }" class="tree-tab">
    <div
      v-if="tabIndices.length > 0"
      :class="{ 'has-tree-actions': treeComponent === 'XTree' }"
      class="tree-view-header"
    >
      <el-dropdown
        :disabled="tabIndices.length === 1"
        :hide-timeout="160"
        placement="bottom-start"
        popper-class="tree-view-popper"
        :show-timeout="80"
        trigger="hover"
        @command="handleTreeViewChange"
        @visible-change="treeViewDropdownVisible = $event"
      >
        <button
          :class="{ 'is-open': treeViewDropdownVisible }"
          class="tree-view-selector"
          type="button"
        >
          <i
            v-if="activeTreeItem?.icon"
            :class="activeTreeItem.icon"
            aria-hidden="true"
            class="tree-view-selector__icon"
          />
          <span class="tree-view-selector__label">{{ activeTreeItem?.title }}</span>
          <el-icon class="tree-view-selector__arrow"><ArrowDown /></el-icon>
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
              <el-icon v-if="item.name === iActiveMenu" class="tree-view-menu__check">
                <Check />
              </el-icon>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <transition appear mode="out-in" name="fade-transform">
      <slot>
        <keep-alive v-if="flag">
          <component
            :is="treeComponent"
            :key="componentKey"
            ref="AutoDataZTree"
            :setting="activeTreeSetting"
            @tree-init-finish="$emit('tree-init-finish', $event)"
            @url-change="handleUrlChange"
          >
            <template #rMenu="{ data }">
              <div>
                <slot :data="data" name="rMenu" />
              </div>
            </template>
          </component>
        </keep-alive>
      </slot>
    </transition>
  </div>
</template>

<script>
import AutoDataZTree from '@/components/Tree/AutoDataZTree/index.vue'
import XTree from '@/components/Tree/XTree/index.vue'

const ACTIVE_TREE_TAB_KEY = 'activeTreeTab'

export default {
  name: 'TabTree',
  components: {
    AutoDataZTree,
    XTree
  },
  props: {
    submenu: {
      type: Array,
      default: () => []
    },
    activeMenu: {
      type: String,
      required: true
    },
    treeComponent: {
      type: String,
      default: 'AutoDataZTree'
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
    hideRMenu() {
      this.$refs.AutoDataZTree?.hideRMenu()
    },
    getSelectedNodes: function () {
      return this.$refs.AutoDataZTree.getSelectedNodes()
    },
    getNodes: function () {
      return this.$refs.AutoDataZTree.getNodes()
    },
    getAllNodes: function () {
      return this.$refs.AutoDataZTree.getAllNodes?.() || this.getNodes()
    },
    getTreeSnapshot: function () {
      return this.$refs.AutoDataZTree.getTreeSnapshot?.()
    },
    selectNode: function (node) {
      return this.$refs.AutoDataZTree.selectNode(node)
    },
    refreshAssetRelationAmounts(nodeIds) {
      return this.$refs.AutoDataZTree?.refreshAssetRelationAmounts?.(nodeIds)
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

.tree-view-header {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 8px;

  &.has-tree-actions {
    padding-right: 48px;
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

  &:hover,
  &:focus-visible {
    outline: none;
    color: var(--el-color-primary);
    background: var(--el-fill-color-light);
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
  flex: none;
  width: 14px;
  margin-right: 6px;
  font-size: 12px;
  text-align: center;
  color: var(--el-text-color-secondary);
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
.tree-view-popper {
  min-width: 132px;
}

.tree-view-popper .tree-view-menu {
  padding: 4px;
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
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.tree-view-menu__label {
  flex: 1;
  min-width: 0;
}

.tree-view-menu__icon {
  flex: none;
  width: 14px;
  margin-right: 8px;
  font-size: 12px;
  text-align: center;
  color: var(--el-text-color-secondary);
}

.tree-view-popper .el-dropdown-menu__item.is-active .tree-view-menu__icon {
  color: var(--el-color-primary);
}

.tree-view-menu__check {
  flex: none;
  margin-left: 16px;
  font-size: 13px;
}
</style>
