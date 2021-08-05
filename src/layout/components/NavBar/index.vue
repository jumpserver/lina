<template>
  <div :class="{'has-logo':showLogo}">
    <div class="nav-header">
      <logo v-if="showLogo" :collapse="isCollapse" />
      <Organization :is-collapse="isCollapse" />
    </div>
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        class="left-menu"
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables['menuBg']"
        :text-color="variables['menuText']"
        :text-weigth="variables['menuTextWeight']"
        :active-text-color="variables['menuActiveText']"
        :unique-opened="true"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item
          v-for="route in currentViewRoute.children"
          :key="route.path"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import Organization from './Organization'
import variables from '@/styles/variables.scss'

export default {
  components: { SidebarItem, Logo, Organization },
  computed: {
    ...mapGetters([
      'currentViewRoute',
      'sidebar'
    ]),
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (!meta.activeMenu) {
        return path
      }
      if (meta.activeMenu.startsWith('/')) {
        return meta.activeMenu
      } else {
        const { location } = this.$router.resolve(meta.activeMenu)
        let path = location.path
        // Todo: 因为在我们通用 view 中，点击创建按钮时，都会向 routes 中注入 params
        // 这里先出此下策
        if (location.params?.id) {
          path = path.replace('/' + location.params.id, '')
        }
        return path
      }
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  mounted() {
    console.log('... ', this.currentViewRoute.children)
  }
}
</script>
<style scoped>
  .nav-header {
    background-image: url('~@/assets/img/header-profile.png');
  }
</style>
