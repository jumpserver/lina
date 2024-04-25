<!-- DrawerComponent.vue -->
<template>
  <el-drawer
    :modal="false"
    :visible.sync="drawerVisible"
    append-to-body
    size="600px"
    title="Create Resource"
    @close="closeDrawer"
  >
    <router-view /> <!-- 这里展示创建页面的路由组件 -->
  </el-drawer>
</template>

<script>
export default {
  data() {
    return {
      drawerVisible: true
    }
  },
  methods: {
    openDrawer() {
      this.drawerVisible = true
    },
    closeDrawer() {
      this.drawerVisible = false
    }
  }
}
</script>
