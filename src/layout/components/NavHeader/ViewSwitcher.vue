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
          {{ viewName }}
        </span>
      </template>
      <el-menu-item
        v-for="view of views"
        :key="view.name"
        v-perms="view.perms"
        :index="view.name"
      >{{ view.label }}</el-menu-item>
    </el-submenu>
  </el-menu>
</template>

<script>
import store from '@/store'
import { mapGetters } from 'vuex'

export default {
  name: 'ViewSwitcher',
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
      let name = this.$t('common.nav.SwitchPage')
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
      const addRoutes = await this.$store.state.permission.addRoutes || []
      const routeArr = []
      addRoutes.forEach(i => {
        const perm = i.meta?.permissions
        if (perm.length > 0 && perm[0]) {
          const obj = {
            name: i.meta.view,
            label: i.meta.title,
            route: i.name,
            perms: perm
          }
          routeArr.push(obj)
        }
      })
      this.views = routeArr
    },
    handleSelectView(key, keyPath) {
      const routeName = this.viewsMapper[key]
      const fromRoute = this.$route
      this.$router.push(routeName, () => {
        store.dispatch('permission/generateViewRoutes', { to: this.$route, from: fromRoute })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.menu-main.el-menu {
  background-color: transparent;
  ::v-deep .el-submenu .el-submenu__title {
    height: 55px;
    line-height: 55px;
    border-bottom: none;
  }
}
.el-submenu.is-opened {
  background-color: transparent;
}
.title-label {
  font-size: 14px;
  vertical-align: unset;
}
</style>
