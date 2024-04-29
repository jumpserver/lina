<template>
  <div>
    <img v-if="icon" :src="icon" alt="icon" class="icon">
    <el-link
      :disabled="disabled"
      :type="col.type || 'info'"
      class="detail"
      :class="{ 'clicked': linkClicked }"
      @click="goDetail"
    >
      <slot>
        {{ iTitle }}
      </slot>
    </el-link>
  </div>
</template>

<script>
import BaseFormatter from './base.vue'

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
          openInNewPage: false,
          removeColorOnClick: false,
          getTitle({ col, row, cellValue }) {
            return cellValue
          },
          getIcon({ col, row, cellValue }) {
            return null
          }
        }
      }
    }
  },
  data() {
    const formatterArgs = Object.assign(this.formatterArgsDefault, this.col.formatterArgs)
    return {
      linkClicked: false,
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
    },
    icon() {
      return this.formatterArgs.getIcon({
        col: this.col,
        row: this.row,
        cellValue: this.cellValue
      })
    },
    detailRoute() {
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
      return detailRoute
    }
  },
  methods: {
    goDetail() {
      if (this.formatterArgs.openInNewPage) {
        this.linkClicked = this.formatterArgs.removeColorOnClick
        const { href } = this.$router.resolve(this.detailRoute)
        window.open(href, '_blank')
      } else {
        this.$router.push(this.detailRoute)
      }
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

.detail {
  line-height: 25px;
  font-size: 13px;
}

.clicked,
.el-link.el-link--info.clicked {
  color: inherit !important;
}

.icon {
  width: 28px;
  height: 28px;
}
</style>
