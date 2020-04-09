<template>
  <el-link class="detail" :type="col.type || 'success'" @click="goDetail">{{ col.linkName }}</el-link>
</template>

<script>
import BaseFormatter from './base'

export default {
  name: 'RouterFormatter',
  extends: BaseFormatter,
  methods: {
    goDetail() {
      const routeName = this.col.route || ''
      this.$router.push({ name: routeName, params: { id: this.cellValue }})
    }
  }

}
</script>

<style scoped>

</style>
