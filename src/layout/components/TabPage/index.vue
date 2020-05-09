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
        <el-tab-pane v-for="item in submenu" :key="item.name" :label="item.title" :name="item.name" />
      </el-tabs>
      <transition name="fade-transform" mode="out-in">
        <slot />
      </transition>
    </div>
  </Page>
</template>

<script>
import Page from '../Page/'
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
    // 尝试从cookie中取活跃的tab
    this.iActiveMenu = this.getPropActiveTab()
  },
  methods: {
    handleTabClick(tab) {
      this.$emit('tab-click', tab)
      this.$emit('update:activeMenu', tab.name)
      this.$cookie.set('activeTab', tab.name, 1)
    },
    getPropActiveTab() {
      const tabActive = this.$cookie.get('activeTab')
      let tabIndex = this.tabIndices[tabActive]
      let activeMenu = ''
      if (tabIndex !== undefined) {
        activeMenu = tabActive
      } else {
        activeMenu = this.activeMenu
      }
      tabIndex = this.tabIndices[activeMenu]
      if (tabIndex === undefined) {
        activeMenu = this.submenu[0].name
      }
      return activeMenu
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
