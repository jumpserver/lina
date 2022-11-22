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
          :icon-class="isRouteMeta.icon"
          style="margin-right: 0;"
        />
        <span
          v-show="!isCollapse"
          style="margin-left: 3px;"
        >{{ isRouteMeta.title || '' }}</span>
        <span v-show="!isCollapse" class="switch-view">
          <el-popover
            placement="right-start"
            width="160"
            trigger="click"
          >
            <ViewSwitcher :mode="'vertical'" />
            <svg-icon slot="reference" class="icon" icon-class="switch" />
          </el-popover>
        </span>
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
    background-color: var(--color-primary);
  }

  .nav-logo {
    height: 50px;
  }

  .nav-title {
    position: relative;
    box-sizing: border-box;
    padding: 17px 0 17px 20px;
    font-size: 16px;
    font-weight: 500;
    color: #1F2329;
    overflow: hidden;
    white-space: nowrap;
    cursor: pointer;
    background-color: var(--menu-bg);
    .switch-view {
      position: absolute;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      z-index: 1;
      &:hover {
        color: var(--menu-active-text);
      }
      .icon {
        &:hover {
          color: var(--submenu-active-text);
        }
      }
    }
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
    height: 48px;
    line-height: 48px;
    margin-top: 2px;
    box-sizing: border-box;
    border-top: 1px solid rgba(31, 35, 41, 0.15);
    background-color: $subMenuBg;

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
      background-color: $subMenuHover;
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
