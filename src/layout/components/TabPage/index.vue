<template>
  <Page>
    <template #title>
      <slot name="title" />
    </template>
    <template #headingRightSide>
      <slot name="headingRightSide" />
    </template>

    <div>
      <el-tabs v-if="submenu.length > 0" slot="submenu" v-model="activeName" class="page-submenu" @tab-click="handleTabClick">
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
    activeName: {
      get() {
        return this.activeMenu
      },
      set(item) {
        this.activeName = item
      }
    }
  },
  methods: {
    handleTabClick(tab) {
      this.$emit('tab-click', tab)
      this.$emit('update:activeMenu', tab.name)
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
