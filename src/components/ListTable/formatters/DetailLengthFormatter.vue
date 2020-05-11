<template>
  <el-link class="detail" :type="col.type || 'success'" @click="goDetail">{{ cellValue.length }}</el-link>
</template>

<script>
import BaseFormatter from './base'
export default {
  name: 'DetailLengthFormatter',
  extends: BaseFormatter,
  methods: {
    goDetail() {
      console.log(this.cellValue.length)
      const defaultRoute = this.$route.name.replace('List', 'Detail')
      const routeName = this.col.route || defaultRoute
      this.$log.debug('Will go to detail route: ', routeName)
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
