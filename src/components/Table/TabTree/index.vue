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
      <template v-for="item in tabIndices">
        <el-tab-pane
          :key="item.name"
          :disabled="item.disabled"
          :label-content="item.labelContent"
          :name="item.name"
        >
          <span slot="label" class="tab-container">
            <i v-if="item.icon && !showText" :class="item.icon" class="tab-icon fa " />
            <span v-if="showText" class="tab-text">{{ item.title }}</span>
            <slot :tab="item.name" name="badge" />
          </span>
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
            @urlChange="handleUrlChange"
          >
            <div slot="rMenu" slot-scope="{data}">
              <slot :data="data" name="rMenu" />
            </div>
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
    this.$eventBus.$on('treeComponentKey', () => {
      this.componentKey += '1'
    })
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
>>> .data-z-tree {
  padding: 0;
}
.page-submenu >>> .el-tabs__nav-wrap {
  position: static;
  .el-tabs__item {
    padding-right: 0;
    padding-left: 0;

    &:hover {
      color: #1ab394;
    }
  }
}
.only-submenu  {
  &>>> .el-tabs__active-bar {
    transform: none!important;
  }
  &>>> .el-tabs__item.is-active {
    text-align: left;
    padding: 0 20px;
  }
}
>>> {
  .ztree {
    padding: 0;
  }
}
</style>
