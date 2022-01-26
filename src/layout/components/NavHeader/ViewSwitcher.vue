<template>
  <el-menu
    default-active="activeIndex"
    class="menu-main"
    mode="horizontal"
    @select="handleSelectView"
  >
    <el-submenu index="2">
      <template slot="title">
        <span class="title-label">
          <i class="fa fa-bars" />
          <span>{{ $t('common.nav.View') }}</span>
        </span>
      </template>
      <el-menu-item
        v-for="view of views"
        :key="view.name"
        v-perms="view.perms"
        :index="view.name"
      >
        <i class="icons" :class="view.icon" />
        <span slot="title" class="icons-title">{{ view.label }}</span>
      </el-menu-item>
    </el-submenu>
  </el-menu>
</template>

<script>
import store from '@/store'
import { mapGetters } from 'vuex'

export default {
  name: 'ViewSwitcher',
  props: {
    showTitle: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      views: []
    }
  },
  computed: {
    ...mapGetters([
      'currentViewRoute'
    ]),
    viewsMapper() {
      const mapper = {}
      const addRoutes = this.$store.state.permission.addRoutes || []
      for (const view of addRoutes) {
        const child = view.children || []
        if (child && child.length > 0) {
          if (child[0].children && child[0].children.length > 0) {
            mapper[view.meta.view] = child[0].children[0].meta.fullPath
          } else {
            mapper[view.meta.view] = view.children[0].meta.fullPath
          }
        } else {
          mapper[view.meta.view] = view.meta.fullPath
        }
      }
      return mapper
    },
    viewName() {
      let name = this.$t('common.nav.HomePage')
      if (this.$route.fullPath === '/') return name
      const viewName = this.currentViewRoute?.meta?.view
      this.views.forEach(i => {
        if (viewName && i.name === viewName) {
          name = i.label
        }
      })
      return name
    }
  },
  created() {
    this.getRootPage()
  },
  methods: {
    async getRootPage() {
      store.dispatch('permission/getFilterRoutes').then(res => {
        this.views = res.filter((item) => item)
      })
    },
    handleSelectView(key, keyPath) {
      const routeName = this.viewsMapper[key] || '/'
      const fromRoute = this.$route
      this.$router.push(routeName, () => {
        store.dispatch('permission/generateViewRoutes', { to: this.$route, from: fromRoute })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-menu--popup-bottom-start {
  margin-top: 0px!important;
}

.menu-main.el-menu {
  background-color: transparent;
  ::v-deep .el-submenu .el-submenu__title {
    height: 55px;
    line-height: 55px;
    border-bottom: none;
  }
}
.el-menu--horizontal .el-menu .el-menu-item {
  display: inline-block!important;
  text-align: center;
  padding: 6px 0px 6px 18px;
  &:hover {
    color: #303133;
  }
  &:last-child {
    padding: 6px 18px 6px 18px;
  }
}
.el-submenu.is-opened {
  background-color: transparent;
}
.title-label {
  padding-left: 12px;
  font-size: 14px;
  vertical-align: unset;
}
.icons {
  display: block;
  font-size: 23px;
  text-align: center;
  margin-bottom: -5px;
}
.icons-title {
  display: inline-block;
  padding-bottom: 10px;
  font-size: 14px;
}
.el-menu--popup-bottom-start {
  margin-top: 0px!important;
}
</style>
