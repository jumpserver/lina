<template>
  <div :class="{'has-logo': showLogo, 'show-orgs': showOrgs}">
    <div class="nav-header">
      <div class="nav-logo">
        <Logo v-if="showLogo" :collapse="isCollapse" />
      </div>
      <div class="active-mobile">
        <ViewSwitcher mode="vertical" class="mobile-view-switch" />
        <Organization v-if="$hasLicense()" class="organization" />
      </div>
      <div class="nav-title" :class="{'collapsed': isCollapse}">
        <svg-icon
          v-if="isRouteMeta.view === 'settings'"
          icon-class="setting-fill"
          style="margin-right: 0;"
        />
        <i
          v-else
          class="fa"
          :class="isRouteMeta.icon"
        />
        <span
          v-show="!isCollapse"
          style="margin-left: 3px;"
        >{{ isRouteMeta.title || '' }}</span>
      </div>
    </div>
    <el-scrollbar class="menu-wrap" wrap-class="scrollbar-wrapper">
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
import Hamburger from '@/components/Hamburger'
import ViewSwitcher from '../NavHeader/ViewSwitcher'
import Organization from '../NavHeader/Organization'
import variables from '@/styles/variables.scss'

export default {
  components: {
    SidebarItem,
    Logo,
    Hamburger,
    ViewSwitcher,
    Organization
  },
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
    showOrgs() {
      return this.$store.getters.hasValidLicense
      // return !this.isCollapse && this.inAdminPage && hasValidLicense
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    },
    isRouteMeta() {
      return this.currentViewRoute.meta || {}
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
  @import "~@/styles/variables.scss";
  .nav-header {
    overflow: hidden;
    background: $subMenuBg url('~@/assets/img/header-profile.png') no-repeat center center;
  }

  .nav-logo {
    height: 55px;
  }

  .nav-title {
    box-sizing: border-box;
    margin: 17px 0 17px 20px;
    font-size: 15px;
    font-weight: 460;
    color: #fff;
    overflow: hidden;
    white-space: nowrap;
    cursor: pointer;
  }

  .collapsed {
    text-align: left;
  }

  .organizations {
    height: 55px;
  }

  .nav-footer {
    display: block;
    width: 100%;
    height: 40px;
    background-color: $subMenuBg;

    .toggle-bar {
      width: 55px;
      height: 40px;
      bottom: 0;
      left: 0;
      top: auto;
      border: 0;
      z-index: 1000;
      position: relative;
      cursor: pointer;
    }

    .toggle-bar:hover {
      background-color: $subMenuHover;
    }

    .hamburger-container {
      left: 2px;
      top: 10px;
      position: absolute;
    }
  }
  .active-mobile {
    display: none;
    &>>> .organization {
      padding-left: 8px;
      background: transparent;
      color: #fff;
    }
    &>>> .menu-main {
      margin-left: -10px;
    }
    &>>> .title-label {
      color: white !important;
    }
  }
  @media screen and (max-width: 992px) {
    .active-mobile {
      display: block;
    }
  }
</style>
