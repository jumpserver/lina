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
      for (const view of this.views) {
        mapper[view.name] = view
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
      store.dispatch('permission/getFilterRoutes').then((res) => {
        this.views = res
      })
    },
    handleSelectView(key, keyPath) {
      const routeName = this.viewsMapper[key]?.route || 'Home'
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
