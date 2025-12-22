<template>
  <div>
    <img v-if="icon" :src="icon" alt="icon" class="icon">
    <el-link
      :class="{ clicked: linkClicked }"
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
      v-if="formatterArgs.drawer && drawerComponent && drawerVisible"
      :component="drawerComponent"
      :has-footer="false"
      :title="drawerTitle"
      :visible.sync="drawerVisible"
      class="detail-drawer"
    />
  </div>
</template>

<script lang="jsx">
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
          route: 'GroupDetail',
          can: true,
          getRoute: null,
          routeQuery: null,
          drawer: false,
          onClick: null,
          openInNewPage: false,
          removeColorOnClick: false,
          beforeClick: () => {},
          getTitle({ row, cellValue }) {
            return cellValue != null ? cellValue : row.name
          },
          getDrawerTitle: null,
          getIcon({ col, row, cellValue }) {
            return null
          }
        }
      }
    },
    preventClick: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const formatterArgs = Object.assign(this.formatterArgsDefault, this.col.formatterArgs)
    return {
      drawerTitle: '',
      linkClicked: false,
      drawerComponent: '',
      showTableDetailDrawer: false,
      currentTemplate: null,
      formatterArgs: formatterArgs,
      drawerVisible: false
    }
  },
  computed: {
    iTitle() {
      return this.formatterArgs.getTitle({
        col: this.col,
        row: this.row,
        cellValue: this.cellValue,
        index: this.index
      })
    },
    disabled() {
      let can = this.formatterArgs.can
      if (typeof can === 'function') {
        can = can({ col: this.col, row: this.row })
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
    callbackArgs() {
      return {
        col: this.col,
        row: this.row,
        cellValue: this.cellValue
      }
    }
  },
  watch: {
    drawerVisible(val) {
      this.$log.debug('>>> DetailFormatter drawerVisible: ', val)
      if (!val) {
        this.drawerComponent = ''
      }
    }
  },
  methods: {
    getTitle() {
      return this.formatterArgs.getTitle({
        col: this.col,
        row: this.row,
        cellValue: this.cellValue,
        index: this.index
      })
    },
    handleClick() {
      if (this.formatterArgs.beforeClick) {
        this.formatterArgs.beforeClick(this.callbackArgs)
      }

      if (this.formatterArgs.onClick) {
        return this.formatterArgs.onClick({
          ...this.callbackArgs,
          detailRoute: this.getDetailRoute(),
          formatterArgs: this.formatterArgs
        })
      }

      if (this.preventClick) {
        return
      }

      this.goDetail()
    },
    getDetailRoute() {
      // const defaultRoute = this.$route.name.replace('List', 'Detail')
      let route = this.formatterArgs.route
      if (this.formatterArgs.getRoute && typeof this.formatterArgs.getRoute === 'function') {
        route = this.formatterArgs.getRoute(this.callbackArgs)
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

<style lang="scss" scoped>
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

:deep(.go-back) {
  display: none;
}

.detail-drawer {
  :deep(.el-drawer__header) {
    border-bottom: none;
    padding-bottom: 1px;
  }
}
</style>
