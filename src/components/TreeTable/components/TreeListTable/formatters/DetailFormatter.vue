<template>
  <el-link class="detail" :type="col.type || 'success'" @click="goDetail">{{ cellValue }}</el-link>
</template>

<script>
import BaseFormatter from './base'
export default {
  name: 'DetailFormatter',
  extends: BaseFormatter,
  methods: {
    goDetail() {
      const defaultRoute = this.$route.name.replace('List', 'Detail')
      const routeName = this.col.route || defaultRoute
      this.$router.push({ name: routeName, params: { id: this.row.id }})
    }
  }
}
</script>

<style scoped>
.detail {
  font-weight: 400;
}
</style>
