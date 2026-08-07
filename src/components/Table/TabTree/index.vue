<template>
  <div class="tree-tab">
    <el-tabs
      v-if="tabIndices.length > 0"
      v-model="iActiveMenu"
      :class="{ 'only-submenu': tabIndices.length === 1 }"
      class="page-submenu"
      stretch
      @tab-click="handleTabClick"
    >
      <template v-for="item in tabIndices" :key="item.name">
        <el-tab-pane :disabled="item.disabled" :label-content="item.labelContent" :name="item.name">
          <template #label>
            <span class="tab-container">
              <i v-if="item.icon && !showText" :class="item.icon" class="tab-icon fa" />
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
            <template #rMenu="{ data }">
              <div>
                <slot :data="data" name="rMenu" />
              </div>
            </template>
          </AutoDataZTree>
        </keep-alive>
      </slot>
    </transition>
  </div>
</template>

<script>
import AutoDataZTree from '@/components/Tree/AutoDataZTree/index.vue'

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
      renderVersion: 0,
      activeTreeName: '',
      activeTreeSetting: {},
      showText: true,
      hideOverflowingText: null
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
    const activeMenu = await this.getPropActiveTab()
    if (activeMenu !== this.activeMenu) {
      this.$emit('update:activeMenu', activeMenu)
    }
    this.changeTreeSetting(activeMenu)
    this.hiddenTextIfNeed()
  },
  beforeUnmount() {
    if (this.hideOverflowingText) {
      window.removeEventListener('resize', this.hideOverflowingText)
      this.hideOverflowingText.cancel?.()
    }
  },
  methods: {
    hiddenTextIfNeed() {
      const vm = this
      this.hideOverflowingText = _.debounce(function () {
        const tabs = document.querySelector('.tree-tab .el-tabs__nav-wrap.is-scrollable')
        vm.showText = !tabs
      }, 800)

      this.hideOverflowingText()
      window.addEventListener('resize', this.hideOverflowingText)
    },
    hideRMenu() {
      this.$refs.AutoDataZTree?.hideRMenu()
    },
    getSelectedNodes: function () {
      return this.$refs.AutoDataZTree.getSelectedNodes()
    },
    getNodes: function () {
      return this.$refs.AutoDataZTree.getNodes()
    },
    selectNode: function (node) {
      return this.$refs.AutoDataZTree.selectNode(node)
    },
    handleUrlChange(url) {
      this.$emit('urlChange', url)
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
      this.renderVersion += 1
      this.componentKey = `${this.$route.name || 'tree'}_${tabName}_${this.renderVersion}`
      this.flag = true
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

      activeTab = this.tabIndices[0]?.name || this.activeMenu || ''
      return activeTab
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.data-z-tree) {
  padding: 0;
}

.page-submenu :deep(.el-tabs__nav-wrap) {
  position: static;

  .el-tabs__item {
    padding-right: 0;
    padding-left: 0;

    &:hover {
      color: var(--color-primary);
    }
  }
}

.only-submenu {
  &:deep(.el-tabs__active-bar) {
    width: 100% !important;
    transform: none !important;
  }

  &:deep(.el-tabs__item.is-active) {
    text-align: left;
    padding: 0 20px;
  }
}

:deep(.ztree) {
  padding: 0;
}
</style>
