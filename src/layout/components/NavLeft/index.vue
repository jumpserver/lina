<template>
  <div :class="{'has-logo': showLogo, 'show-orgs': showOrgs}">
    <div class="nav-header">
      <div class="active-mobile">
        <Organization v-if="$hasLicense()" class="organization" />
      </div>
      <div class="nav-title">
        <span v-show="!isCollapse" style="margin-left: 5px;">
          {{ isRouteMeta.title || '' }}
        </span>

        <span :class="switchViewOtherClasses" class="switch-view active-switch-view">
          <el-popover
            placement="right-start"
            trigger="hover"
            width="160"
          >
            <ViewSwitcher mode="vertical" />
            <svg-icon slot="reference" class="icon" icon-class="switch" />
          </el-popover>
        </span>
        <span class="switch-view show-switch-view">
          <svg-icon class="icon" icon-class="switch" @click="toggleSwitch" />
        </span>
      </div>
    </div>
    <el-scrollbar class="menu-wrap" wrap-class="scrollbar-wrapper">
      <el-menu
        :active-text-color="variables['menuActiveText']"
        :background-color="variables['menuBg']"
        :collapse="isCollapse"
        :collapse-transition="false"
        :default-active="activeMenu"
        :default-openeds="defaultOpensMenu"
        :text-color="variables['menuText']"
        :text-weigth="variables['menuTextWeight']"
        :unique-opened="true"
        class="left-menu"
        mode="vertical"
      >
        <sidebar-item
          v-for="route in currentViewRoute.children"
          :key="route.path"
          :base-path="route.path"
          :item="route"
        />
      </el-menu>
    </el-scrollbar>
    <div class="nav-footer">
      <div class="toggle-bar">
        <Hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
      </div>
    </div>
    <div :class="{'is-show': viewShown}" class="mobile-menu" @click="viewShown = false">
      <ViewSwitcher :mode="'vertical'" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SidebarItem from './SidebarItem'
import Hamburger from '@/components/Widgets/Hamburger'
import ViewSwitcher from '../NavHeader/ViewSwitcher'
import Organization from '../NavHeader/Organization'
import variables from '@/styles/variables.scss'

export default {
  components: {
    SidebarItem,
    Hamburger,
    ViewSwitcher,
    Organization
  },
  data() {
    return {
      viewShown: false,
      switchViewOtherClasses: ''
    }
  },
  computed: {
    ...mapGetters([
      'currentViewRoute',
      'defaultOpensMenu',
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
  mounted() {
    this.setViewIconAttention()
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    toggleSwitch() {
      this.viewShown = true
    },
    setViewIconAttention() {
      const t = setInterval(() => {
        this.switchViewOtherClasses = this.switchViewOtherClasses ? '' : 'hover-switch-view'
      }, 1000)
      setTimeout(() => {
        clearInterval(t)
        this.switchViewOtherClasses = ''
      }, 2000)
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

  .hover-switch-view {
    background: var(--menu-hover) !important;
    color: var(--color-primary);
  }

  .nav-title {
    position: relative;
    box-sizing: border-box;
    height: 50px;
    padding: 14px 0 13px 20px;
    font-size: 16px;
    font-weight: 500;
    color: #1F2329;
    overflow: hidden;
    white-space: nowrap;
    cursor: pointer;
    background-color: var(--menu-bg);
    transition: all 0.3s;

    .switch-view {
      padding: 6px;
      position: absolute;
      top: 50%;
      right: 16px;
      transform: translateY(-50%);
      z-index: 1;
      line-height: 10px;
      border-radius: 3px;

      &:hover {
        background: var(--menu-hover) !important;
      }

      .icon {
        margin-right: 0 !important;

        &:hover {
          color: var(--color-primary);
        }
      }
    }

    .active-switch-view {
      display: inline-block;
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

  .is-show {
    display: block!important;;
  }

  .mobile-menu {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding-top: 10px;
    background: #fff;
    z-index: 100;
  }

  .show-switch-view {
    display: none;
  }

  .active-mobile {
    display: none;

    & >>> .organization {
      height: 48px;
      line-height: 48px;
      padding-left: 8px;
      background: transparent;
      color: #fff;
      border-bottom: 1px solid rgba(31, 35, 41, .15);
      .el-input--prefix .el-input__inner {
        height: 48px!important;
        line-height: 48px!important;
      }
      .svg-icon {
        color: #FFF!important;
        margin-right:0px!important;
      }
    }

    & >>> .title-label {
      color: white !important;
    }

    .mobile-view-switch {
      &>>> .el-menu-item.is-active {
      color: var(--menu-text-active)!important;
      .svg-icon {
        color: var(--menu-text-active)!important;
      }
    }
    }
  }

  @media screen and (max-width: 992px) {
    .active-mobile {
      display: block;
    }
    .active-switch-view {
      display: none!important;
    }
    .show-switch-view {
      display: block!important;
    }
  }
</style>
