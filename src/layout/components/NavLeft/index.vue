<template>
  <div :class="{'has-logo': showLogo, 'show-orgs': showOrgs}">
    <div class="nav-header">
      <div class="nav-logo">
        <Logo v-if="showLogo" :collapse="isCollapse" />
      </div>
      <div class="active-mobile">
        <ViewSwitcher mode="vertical" class="mobile-view-switch" />
        <Organization class="organization" />
      </div>
      <div class="nav-title" :class="{'collapsed': isCollapse}">
        {{ isTitle }}
      </div>
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
import variables from '@/styles/variables.scss'
import Hamburger from '@/components/Hamburger'
import ViewSwitcher from '../NavHeader/ViewSwitcher'
import Organization from '../NavHeader/Organization'

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
    isTitle() {
      return this.currentViewRoute.meta?.title || ''
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
  }

  .nav-logo {
    height: 55px;
  }

  .nav-title {
    box-sizing: border-box;
    height: 55px;
    padding: 17px 0 17px 22px;
    font-size: 15px;
    font-weight: 460;
    color: #fff;
    //background: #293846;
  }

  .collapsed {
    padding: 6px 12px!important;
  }

  .organizations {
    height: 55px;
  }

  .nav-footer {
    display: block;
    width: 100%;
    height: 40px;
    background-color: #293846;

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
      background-color: rgb(59, 76, 91);
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
