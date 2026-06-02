<template>
  <div class="tree-tab">
    <el-tabs
      v-if="tabIndices.length > 0"
      v-model="iActiveMenu"
      :class="{ 'only-submenu': tabIndices.length === 1}"
      class="page-submenu"
      stretch
      @tab-click="handleTabClick"
    >
      <template v-for="item in tabIndices" :key="item.name">
        <el-tab-pane
          :disabled="item.disabled"
          :label-content="item.labelContent"
          :name="item.name"
        >
          <template #label>
            <span class="tab-container">
              <i v-if="item.icon && !showText" :class="item.icon" class="tab-icon fa " />
              <span v-if="showText" class="tab-text">{{ item.title }}</span>
              <slot :tab="item.name" name="badge" />
            </span>
          </template>
        </el-tab-pane>
      </template>
    </el-tabs>
    <transition appear mode="out-in" name="fade-transform">
      <slot>
        <keep-alive v-if="flag">
          <AutoDataZTree
            :key="componentKey"
            ref="AutoDataZTree"
            :setting="activeTreeSetting"
            @url-change="handleUrlChange"
          >
            <template #rMenu>
              <slot name="rMenu" />
            </template>
          </AutoDataZTree>
        </keep-alive>
      </slot>
    </transition>
  </div>
</template>

<script>
import AutoDataZTree from '@/components/Tree/AutoDataZTree/index.vue'
import merge from 'webpack-merge'

const ACTIVE_TREE_TAB_KEY = 'activeTreeTab'

export default {
  name: 'TabTree',
  components: {
    AutoDataZTree
  },
  props: {
    submenu: {
      type: Array,
      default: () => []
    },
    activeMenu: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      flag: false,
      componentKey: 1,
      activeTreeSetting: {},
      showText: true,
      keyMap: {}
    }
  },
  computed: {
    iActiveMenu: {
      get() {
        return this.activeMenu
      },
      set(item) {
        this.$emit('update:activeMenu', item)
        this.changeTreeSetting(item)
      }
    },
    tabIndices() {
      const map = []
      this.submenu.forEach((v) => {
        const hidden = typeof v.hidden === 'function' ? v.hidden() : v.hidden
        if (!hidden) {
          map.push(v)
        }
      })
      return map
    }
  },
  watch: {
    activeMenu(val) {
      this.changeTreeSetting(val)
    }
  },
  async mounted() {
    this.iActiveMenu = await this.getPropActiveTab()
    this.hiddenTextIfNeed()
  },
  methods: {
    hiddenTextIfNeed() {
      const vm = this
      const hideOverflowingText = _.debounce(function() {
        const tabs = document.querySelector('.tree-tab .el-tabs__nav-wrap.is-scrollable')
        vm.showText = !tabs
      }, 800)

      hideOverflowingText()
      window.addEventListener('resize', hideOverflowingText)
    },
    hideRMenu() {
      this.$refs.AutoDataZTree?.hideRMenu()
    },
    getSelectedNodes: function() {
      return this.$refs.AutoDataZTree.getSelectedNodes()
    },
    getNodes: function() {
      return this.$refs.AutoDataZTree.getNodes()
    },
    selectNode: function(node) {
      return this.$refs.AutoDataZTree.selectNode(node)
    },
    handleUrlChange(url) {
      this.$emit('urlChange', url)
    },
    handleTabClick(tab) {
      this.componentKey = this.keyMap[tab.name]
      if (!this.componentKey) {
        this.componentKey = this.$route.name + '_' + tab.name
      }
      this.$emit('tab-click', tab)
      this.$emit('update:activeMenu', tab.name)
      this.$cookie.set(ACTIVE_TREE_TAB_KEY, tab.name, 1)

      if (this.$router.currentRoute.query[ACTIVE_TREE_TAB_KEY]) {
        this.$router.push({
          query: merge(this.$route.query, { [ACTIVE_TREE_TAB_KEY]: '' })
        })
      }
    },
    changeTreeSetting(tabName) {
      const vm = this
      try {
        this.flag = false
        for (const tab of this.submenu) {
          if (tab.name === tabName) {
            vm.activeTreeSetting = tab.treeSetting
            break
          }
        }
      } finally {
        this.flag = true
      }
    },
    getPropActiveTab() {
      let activeTab = ''

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

      activeTab = this.tabIndices[0].name
      return activeTab
    }
  }
}
</script>

<style lang="scss" scoped>
.tree-tab {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-height: 0;
  height: 100%;
  color: var(--N800);
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
  font-stretch: normal;
  font-style: normal;
  font-synthesis: none;
  font-synthesis-style: none;
  font-variation-settings: normal;
}

.page-submenu {
  flex: 0 0 auto;

  :deep(.el-tabs__header) {
    margin: 0;
    border-bottom: 1px solid var(--N200);
    background: var(--surface-panel);
  }

  :deep(.el-tabs__nav-wrap) {
    position: relative;
    padding: 0 var(--space-2);

    &::after {
      height: 0;
    }
  }

  :deep(.el-tabs__nav) {
    display: flex;
    align-items: center;
  }

  :deep(.el-tabs__item) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    padding: 0 var(--space-3);
    color: var(--N600);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    line-height: 36px;
    transition: color var(--duration-fast) var(--ease-standard);

    &:hover {
      color: var(--color-primary);
    }

    &.is-active {
      color: var(--color-primary);
    }
  }

  :deep(.el-tabs__active-bar) {
    height: 2px;
    border-radius: 999px;
    background-color: var(--color-primary);
  }

  :deep(.tab-container) {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    min-width: 0;
    line-height: 1;
  }

  :deep(.tab-icon) {
    width: var(--icon-size-base);
    height: var(--icon-size-base);
    margin-right: 0 !important;
    font-family: FontAwesome !important;
    font-size: var(--icon-size-base);
    line-height: var(--icon-size-base);
  }

  :deep(.tab-text) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.only-submenu {
  :deep(.el-tabs__active-bar) {
    transform: none !important;
  }

  :deep(.el-tabs__item.is-active) {
    text-align: left;
    padding: 0 var(--space-3);
  }
}

:deep(.data-z-tree) {
  flex: 1 1 auto;
  min-height: 0;
  padding: 0;
}

:deep(.treebox) {
  min-height: 0;
  border: 1px solid var(--N200);
  border-radius: var(--radius-card);
  background: var(--surface-panel);
  overflow: hidden;
}

:deep(.ztree) {
  padding: 0 var(--space-2);
}

:deep(.ztree li) {
  line-height: 28px;
}

:deep(.ztree li ul) {
  padding-left: var(--space-4);
}

:deep(.ztree li a) {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  max-width: 100%;
  height: 28px;
  padding: 0 var(--space-2);
  border: 0;
  border-radius: var(--radius-control);
  color: var(--N700) !important;
  line-height: 28px;
  transition: background-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}

:deep(.ztree li a:hover) {
  background: var(--N50);
  box-shadow: none;
}

:deep(.ztree li a.curSelectedNode) {
  background: rgba(26, 179, 148, 0.08);
  color: var(--color-primary) !important;
  opacity: 1;
}

:deep(.ztree li span.node_name) {
  font-family: 'Inter','PingFang SC', 'Microsoft YaHei', Arial, sans-serif !important;
  font-stretch: normal;
  font-style: normal !important;
  font-synthesis: none;
  font-synthesis-style: none;
  font-variation-settings: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
