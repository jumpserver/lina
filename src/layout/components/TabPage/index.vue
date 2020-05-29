<template>
  <Page>
    <template #title>
      <slot name="title" />
    </template>
    <template #headingRightSide>
      <slot name="headingRightSide" />
    </template>

    <div>
      <el-tabs v-if="submenu.length > 0" slot="submenu" v-model="iActiveMenu" class="page-submenu" @tab-click="handleTabClick">
        <el-tab-pane v-for="item in submenu" :key="item.name" :label="item.title" :label-content="item.labelContent" :name="item.name" />
      </el-tabs>
      <transition name="fade-transform" mode="out-in">
        <slot />
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
      const map = {}
      this.submenu.forEach((v, i) => {
        map[v.name] = i
      })
      return map
    }
  },
  mounted() {
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
      let tabObj = null

      const activeTabs = [
        this.$route.query[ACTIVE_TAB_KEY],
        this.$cookie.get(ACTIVE_TAB_KEY),
        this.activeMenu
      ]

      for (activeTab of activeTabs) {
        tabObj = this.tabIndices[activeTab]
        if (tabObj !== undefined) {
          return activeTab
        }
      }

      return this.submenu[0].name
    }
  }
}
</script>

<style scoped>
  .page-submenu >>> .el-tabs__header {
    background-color: white;
    margin-left: -25px;
    padding-left: 25px;
    margin-right: -25px;
    padding-right: 25px;
    margin-top: -30px;
  }
  .page-submenu >>> .el-tabs__nav-wrap {
    position: static;
  }
</style>
