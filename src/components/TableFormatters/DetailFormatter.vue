<template>
  <el-link class="detail" :disabled="disabled" :type="col.type || 'success'" @click="goDetail">{{ iTitle }}</el-link>
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
          getRoute: null,
          routeQuery: null,
          can: true,
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
      formatterArgs: formatterArgs
    }
  },
  computed: {
    iTitle() {
      return this.formatterArgs.getTitle({
        col: this.col,
        row: this.row,
        cellValue: this.cellValue
      })
    },
    disabled() {
      let can = this.formatterArgs.can
      if (typeof can === 'function') {
        can = can(this.col)
      }
      return !can
    }
  },
  methods: {
    goDetail() {
      // const defaultRoute = this.$route.name.replace('List', 'Detail')
      let route = this.formatterArgs.route
      if (this.formatterArgs.getRoute && typeof this.formatterArgs.getRoute === 'function') {
        route = this.formatterArgs.getRoute({
          row: this.row,
          col: this.col,
          cellValue: this.cellValue
        })
      }
      if (!route) {
        console.error('No route found')
        return
      }
      let detailRoute = { replace: true }
      if (typeof route === 'string') {
        detailRoute.name = route
        detailRoute.params = { id: this.row.id }
      } else {
        detailRoute = route
      }

      const routeQuery = this.formatterArgs.routeQuery
      if (routeQuery && typeof routeQuery === 'object') {
        detailRoute.query = this.formatterArgs.routeQuery
      }
      this.$router.push(detailRoute)
      // const routeName = this.formatterArgs.route
      // this.$log.debug('Will go to detail route: ', routeName)
      // this.$router.push({ name: routeName, params: { id: this.row.id }, query: routeQuery })
    }
  }
}
</script>

<style scoped>
.detail {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 400;
}
</style>
