<template>
  <div :class="{'has-logo': showLogo}">
    <div class="nav-header">
      <Logo v-if="showLogo" :collapse="isCollapse" />
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
    <div class="nav-footer">
      <div class="toggle-bar">
        <Hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import Organization from './Organization'
import variables from '@/styles/variables.scss'
import Hamburger from '@/components/Hamburger'

export default {
  components: { SidebarItem, Logo, Organization, Hamburger },
  computed: {
    ...mapGetters([
      'currentViewRoute',
      'sidebar'
    ]),
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (!meta.activeMenu && !meta.hidden) {
        return path
      }
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      const { location } = this.$router.resolve('_Mark_')
      let locPath = location.path.replace('_Mark_', '')
      const parmaId = location.params?.id || route.params?.id
      if (parmaId) {
        locPath = locPath.replace('/' + parmaId, '')
      }
      if (locPath.endsWith('/')) {
        locPath = locPath.slice(0, locPath.length - 1)
      }
      this.$log.debug('Active menu path3: ', locPath)
      return locPath
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
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    }
  }
}
</script>
<style lang="scss" scoped>
  .nav-header {
    background-image: url('~@/assets/img/header-profile.png');
    height: 50px;
  }

  .nav-footer {
    display: block;
    width: 100%;
    height: 45px;
    background-color: #293846;

    .toggle-bar {
      width: 55px;
      height: 100%;
      bottom: 0;
      left: 0;
      top: auto;
      border: 0;
      z-index: 1000;
      position: relative;
      cursor: pointer;
    }

    .toggle-bar:hover {
      background-color: rgb(47, 64, 80);
    }

    .hamburger-container {
      left: 0;
      top: 13px;
      position: absolute;
    }
  }
</style>
