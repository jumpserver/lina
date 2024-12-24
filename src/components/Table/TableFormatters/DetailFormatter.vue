<template>
  <div>
    <img v-if="icon" :src="icon" alt="icon" class="icon">
    <el-link
      :class="{ 'clicked': linkClicked }"
      :disabled="disabled"
      :type="col.type || 'info'"
      class="detail"
      @click="handleClick"
    >
      <slot>
        {{ iTitle }}
      </slot>
    </el-link>
    <Drawer
      v-if="formatterArgs.drawer && drawerVisible"
      :component="drawerComponent"
      :title="iTitle"
      :visible.sync="drawerVisible"
    />
  </div>
</template>

<script>
import BaseFormatter from './base.vue'
import Drawer from '@/components/Drawer/index.vue'

export default {
  name: 'DetailFormatter',
  components: { Drawer },
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
          onClick: null,
          openInNewPage: false,
          removeColorOnClick: false,
          drawer: false,
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
      showTableDetailDrawer: false,
      drawerTitle: '',
      currentTemplate: null,
      formatterArgs: formatterArgs,
      drawerComponent: '',
      drawerVisible: false
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
    }
  },
  methods: {
    getRouteComponent() {
      const route = this.getDetailRoute()
      const routes = this.$router.resolve(route)
      if (!routes) {
        return
      }
      const matched = routes.resolved.matched.filter(item => item.name === route.name && item.components)
      if (matched.length === 0) {
        return
      }
      if (matched[0] && matched[0].components?.default) {
        return matched[0].components.default
      }
    },
    showDrawer() {
      if (this.formatterArgs.drawerComponent) {
        this.drawerComponent = this.formatterArgs.drawerComponent
      } else {
        this.drawerComponent = this.getRouteComponent()
      }
      const route = this.getDetailRoute()
      if (route?.query?.tab) {
        this.$cookie.set(route.name, route.query.tab, 1)
      }
      this.$store.dispatch('common/setDrawerActionMeta', {
        action: 'detail',
        row: this.row,
        col: this.col,
        id: route.params.id
      }).then(() => {
        this.drawerTitle = this.cellValue
        this.drawerVisible = true
      })
    },
    handleClick() {
      if (this.formatterArgs.onClick) {
        this.formatterArgs.onClick({
          col: this.col,
          row: this.row,
          cellValue: this.cellValue
        })
        return
      }
      if (this.formatterArgs.drawer) {
        this.showDrawer()
        return
      }
      this.goDetail()
    },
    getDetailRoute() {
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
    },
    goDetail() {
      const detailRoute = this.getDetailRoute()

      if (this.formatterArgs.openInNewPage) {
        const { href } = this.$router.resolve(detailRoute)
        this.linkClicked = this.formatterArgs.removeColorOnClick
        return window.open(href, '_blank')
      }

      this.$router.push(detailRoute)
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

::v-deep .go-back {
  display: none;
}
</style>
