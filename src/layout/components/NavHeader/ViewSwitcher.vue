<template>
  <el-menu
    default-active="activeIndex"
    class="menu-main"
    mode="horizontal"
    @select="handleSelectView"
  >
    <el-submenu index="2">
      <template slot="title">
        <span style="font-size: 14px"><i class="fa fa-bars" /> {{ viewName }}</span>
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
      views: [
        {
          name: 'admin',
          label: '管理视图',
          route: 'AdminView',
          perms: ['admin']
        },
        {
          name: 'audit',
          label: '审计视图',
          route: 'AuditView',
          perms: ['assets.add_systemuser']
        },
        {
          name: 'user',
          label: '用户视图',
          route: 'UserView',
          perms: ['use']
        }
      ]
    }
  },
  computed: {
    ...mapGetters([
      'currentViewRoute'
    ]),
    viewsMapper() {
      const mapper = {}
      for (const view of this.views) {
        mapper[view.name] = view
      }
      return mapper
    },
    viewName() {
      const viewName = this.currentViewRoute?.meta?.view
      const name = this.viewsMapper[viewName]?.label
      return name
    }
  },
  methods: {
    handleSelectView(key, keyPath) {
      const routeName = this.viewsMapper[key]?.route || 'AdminView'
      const fromRoute = this.$route
      this.$router.push({ name: routeName }, () => {
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
  }

}

.el-submenu.is-opened {
  background-color: transparent;
}
</style>
