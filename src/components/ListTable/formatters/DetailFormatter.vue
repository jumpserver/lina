<template>
  <el-link class="detail" :type="col.type || 'success'" @click="goDetail">{{ iTitle }}</el-link>
</template>

<script>
import BaseFormatter from './base'
export default {
  name: 'DetailFormatter',
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          route: this.$route.name.replace('List', 'Detail'),
          routeQuery: {},
          getTitle({ col, row, cellValue }) {
            return cellValue
          }
        }
      }
    }
  },
  data() {
    const formatterArgs = Object.assign(this.formatterArgsDefault, this.col.formatterArgs)
    return {
      formatterArgs: formatterArgs,
      iTitle: formatterArgs.getTitle({ col: this.col, row: this.row, cellValue: this.cellValue })
    }
  },
  methods: {
    goDetail() {
      // const defaultRoute = this.$route.name.replace('List', 'Detail')
      const routeName = this.formatterArgs.route
      const routeQuery = this.formatterArgs.routeQuery
      this.$log.debug('Will go to detail route: ', routeName)
      this.$router.push({ name: routeName, params: { id: this.row.id }, query: routeQuery })
    }
  }
}
</script>

<style scoped>
.detail {
  font-weight: 400;
}
</style>
