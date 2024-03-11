<template>
  <Page v-bind="$attrs">
    <template #headingRightSide>
      <slot name="headingRightSide" />
    </template>

    <div>
      <el-tabs
        v-if="tabIndices.length > 0"
        slot="submenu"
        v-model="iActiveMenu"
        class="page-submenu"
        @tab-click="handleTabClick"
      >
        <template v-for="item in tabIndices">
          <el-tab-pane
            :key="item.name"
            :disabled="item.disabled"
            :label-content="item.labelContent"
            :name="item.name"
          >
            <span slot="label">
              <i v-if="item.icon" :class="item.icon" class="fa " />
              {{ item.title }}
              <slot :tab="item.name" name="badge" />
            </span>
          </el-tab-pane>
        </template>
      </el-tabs>

      <transition v-if="loading" appear mode="out-in" name="fade-transform">
        <slot>
          <keep-alive>
            <component :is="computeActiveComponent" />
          </keep-alive>
        </slot>
      </transition>
    </div>
  </Page>
</template>

<script>
import Page from '../Page/'
import merge from 'webpack-merge'

const ACTIVE_TAB_KEY = 'activeTab'

export default {
  name: 'TabPage',
  components: {
    Page
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
      loading: true
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
    },
    computeActiveComponent() {
      let needActiveComponent = ''
      for (const i of this.submenu) {
        if (i.component && (i.name === this.iActiveMenu)) {
          needActiveComponent = i.component
          break
        }
      }
      return needActiveComponent
    }
  },
  watch: {
    $route(to, from) {
      const activeTab = to.query?.activeTab
      if (activeTab && this.iActiveMenu !== activeTab) {
        this.iActiveMenu = activeTab
        this.loading = false
        setTimeout(() => {
          this.loading = true
        })
      }
    }
  },
  created() {
    this.iActiveMenu = this.getPropActiveTab()
  },
  methods: {
    handleTabClick(tab) {
      this.$emit('tab-click', tab)
      this.$emit('update:activeMenu', tab.name)
      this.$cookie.set(ACTIVE_TAB_KEY, tab.name, 1)

      if (this.$router.currentRoute.query[ACTIVE_TAB_KEY]) {
        this.$router.push({
          query: merge(this.$route.query, { [ACTIVE_TAB_KEY]: '' })
        })
      }
    },
    getPropActiveTab() {
      let activeTab = ''

      const preActiveTabs = [
        this.$route.query[ACTIVE_TAB_KEY],
        this.$cookie.get(ACTIVE_TAB_KEY),
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

<style lang='scss' scoped>
.page-submenu > > > .el-tabs__header {
  background-color: white;
  margin-left: -25px;
  padding-left: 25px;
  margin-right: -25px;
  padding-right: 25px;
  margin-top: -30px;

  .el-tabs__item {

    i {
      opacity: 0.6;
    }
  }

}

.page-submenu > > > .el-tabs__nav-wrap {
  position: static;
}
</style>
