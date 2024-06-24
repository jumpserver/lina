<template>
  <div :class="{'has-logo': showLogo, 'show-orgs': showOrgs, 'collapsed': isCollapse}" class="left-side-wrapper">
    <div class="nav-header">
      <div class="active-mobile">
        <Organization v-if="$hasLicense()" class="organization" />
      </div>
      <div class="nav-title">
        <span :class="switchViewOtherClasses" class="switch-view active-switch-view">
          <el-popover
            :open-delay="200"
            placement="right-start"
            trigger="hover"
          >
            <span slot="reference" style="width: 100%">
              <span v-show="!isCollapse" class="view-title">
                {{ isRouteMeta.title || '' }}
              </span>
              <span class="icon-zone">
                <svg-icon class="icon" icon-class="switch" />
              </span>
            </span>
            <ViewSwitcher mode="vertical" @view-change="handleViewChange" />
          </el-popover>
        </span>
      </div>
    </div>
    <div class="menu-wrap el-scrollbar">
      <el-menu
        :active-text-color="variables['menuActiveText']"
        :background-color="variables['menuBg']"
        :collapse="isCollapse"
        :collapse-transition="false"
        :default-active="activeMenu"
        :default-openeds="defaultOpensMenu"
        :text-color="variables['menuText']"
        :text-weigth="variables['menuTextWeight']"
        :unique-opened="false"
        class="left-menu"
        mode="vertical"
      >
        <sidebar-item
          v-for="route in currentViewRoute.children"
          :key="route.path"
          :base-path="route.path"
          :collapse="isCollapse"
          :item="route"
        />
      </el-menu>
    </div>
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
      switchViewOtherClasses: '',
      defaultMenu: []
    }
  },
  computed: {
    ...mapGetters([
      'currentViewRoute',
      'sidebar'
    ]),
    defaultOpensMenu() {
      return []
    },
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
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    toggleSwitch() {
      this.viewShown = true
    },
    handleViewChange() {
      // 此处不使用 nextTick 的原因可能是由于子组件中切换 tag 需要触发异步的 dispatch
      setTimeout(() => {
        // this.setLeastMenuOpen()
      }, 500)
    },
    setLeastMenuOpen() {
      const hasOpened = document.querySelector('.el-submenu-sidebar.submenu-item.el-submenu.is-opened')
      if (hasOpened) {
        return
      }
      const el = document.querySelector('.el-submenu__title')
      if (el) {
        el.click()
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import "~@/styles/variables.scss";

$mobileHeight: 40px;
$origin-color: #ffffff;
$hover-bg-color: #e6e6e6;
$hover-text-color: #606266;
$hover-border-color: #d2d2d2;

.left-side-wrapper {
  .nav-header {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;

    .active-mobile {
      display: none;

      ::v-deep .organization {
        height: $mobileHeight;
        padding-left: 20px;
        background: var(--color-primary-dark-1);
        color: $origin-color;

        .el-input--prefix {
          display: flex;
          align-items: center;
          height: 40px;
          line-height: 40px;
        }

        .svg-icon {
          color: $origin-color !important;
          margin-right: 0 !important;
        }
      }

      & ::v-deep .title-label {
        color: $origin-color !important;
      }

      .mobile-view-switch {
        &::v-deep .el-menu-item.is-active {
          color: var(--menu-text-active) !important;

          .svg-icon {
            color: var(--menu-text-active) !important;
          }
        }
      }
    }

    .nav-title {
      display: flex;
      align-items: center;
      width: 100%;
      height: 50px;
      font-size: 16px;
      font-weight: 500;
      overflow: hidden;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.3s;
      color: var(--color-text-primary);
      background-color: var(--menu-bg);
      border-bottom: 1px solid var(--color-border);

      .switch-view {
        width: 100%;
        padding: 5px;

        ::v-deep .el-popover__reference {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0 10px 0 15px;

          .view-title {
            width: calc(100% - 10px);
            display: inline-block
          }

          .icon-zone {
            display: flex;
            align-items: center;
            padding: 6px;
            box-sizing: border-box;

            .icon {
              width: 1.05em;
              height: 1.05em;
              margin-right: 0 !important;
            }

            &:hover {
              color: $hover-text-color;
              border-color: $hover-border-color;
              background-color: $hover-bg-color;
              border-radius: 4px;
            }
          }
        }
      }
    }
  }

  .nav-footer {
    display: flex;
    justify-content: flex-start;
    border-top: 1px solid rgba(31, 35, 41, 0.15);
    background-color: $subMenuBg;

    .toggle-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 54px;
      height: 40px;
      border: 0;
      cursor: pointer;

      ::v-deep .hamburger-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        padding: 0 !important;

        .svg-icon {
          margin-right: 0 !important;
        }
      }

      &:hover {
        color: $hover-text-color;
        border-color: $hover-border-color;
        background-color: $hover-bg-color;
      }
    }
  }

  .is-show {
    display: block !important;;
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

  &.collapsed .nav-title .switch-view {
    ::v-deep .el-popover__reference {
      .icon-zone {
        margin-right: 0;
      }

      .switch-view .icon {
        margin-left: 0;
      }
    }
  }
}

@media screen and (max-width: 992px) {
  ::v-deep .active-mobile {
    display: block !important;
  }
}
</style>
