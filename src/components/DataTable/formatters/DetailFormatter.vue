<template>
  <el-link :type="col.type || 'success'" @click="goDetail">{{ cellValue }}</el-link>
</template>

<script>
export default {
  name: 'DetailFormatter',
  props: {
    row: {
      type: Object,
      default: null
    },
    col: {
      type: Object,
      default: null
    }
  },
  computed: {
    cellValue() {
      return this.row[this.col.prop]
    }
  },
  methods: {
    goDetail() {
      const routeName = this.col.route || ''
      this.$router.push({ name: routeName, params: { id: this.row.id }})
    }
  }
}
</script>

<style scoped>

</style>
