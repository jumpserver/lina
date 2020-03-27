<template>
  <el-tabs v-if="submenu.length > 0" v-model="activeName" class="page-heading-submenu">
    <el-tab-pane v-for="item in submenu" :key="item.name" :label="item.title" :name="item.name">
      {{ item.name }}
    </el-tab-pane>
  </el-tabs>
</template>

<script>
export default {
  name: 'PageSubMenu',
  props: {
    submenu: {
      type: Array,
      default: () => []
    },
    activeMenu: {
      type: String,
      default: () => ''
    }
  },
  data() {
    return {
      activeName: this.activeMenu || null
    }
  }
}
</script>

<style scoped>
  .page-heading-submenu {
    background-color: white;
    padding: 0 25px;
  }

  .page-heading-submenu >>> .el-tabs__header {
    margin: 0;
  }
</style>
