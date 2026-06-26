<template>
  <div class="navbar">
    <hamburger
      v-if="isMobile"
      :is-active="sidebar.opened"
      class="hamburger-container is-show-menu"
      @toggle-click="toggleSideBar"
    />
    <ul class="navbar-left">
      <li class="left-item">
        <div class="nav-logo">
          <Logo v-if="showLogo" :collapse="false" />
        </div>
      </li>
      <li v-if="orgsShow" class="left-item organization-item">
        <Organization :disabled="orgsDisabled" class="organization" />
      </li>
    </ul>
    <ul class="navbar-right">
      <li class="header-item header-icon none-hover">
        <Search @search-open="handleSearchOpen" />
      </li>
      <li class="header-item header-icon">
        <el-tooltip :content="$tc('SiteMessageList')" :open-delay="500" effect="dark">
          <SiteMessages />
        </el-tooltip>
      </li>
      <li v-if="$hasPerm(['rbac.view_webterminal'])" class="header-item header-icon">
        <el-tooltip :content="$tc('WebTerminal')" :open-delay="500" effect="dark">
          <WebTerminal />
        </el-tooltip>
      </li>
      <li v-if="ticketsEnabled" class="header-item header-hover">
        <el-tooltip :content="$tc('Ticket')" :open-delay="500" effect="dark">
          <Tickets />
        </el-tooltip>
      </li>
      <li v-if="$hasPerm('settings.view_setting')" class="header-item header-icon">
        <el-tooltip :content="$tc('SystemSetting')" :open-delay="500" effect="dark">
          <SystemSetting />
        </el-tooltip>
      </li>
      <li class="header-item active-menu">
        <Help />
      </li>
      <li v-if="!isMobile" class="header-item language">
        <Language />
      </li>
      <li class="header-item header-profile">
        <AccountDropdown />
      </li>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Hamburger from '@/components/Widgets/Hamburger'
import AccountDropdown from './AccountDropdown'
import SiteMessages from './SiteMessages'
import Help from './Help'
import WebTerminal from './WebTerminal'
import Tickets from './Tickets'
import Organization from './Organization'
import SystemSetting from './SystemSetting'
import Logo from '../NavLeft/Logo'
import Language from './Language'
import Search from './Search'

export default {
  components: {
    Hamburger,
    Organization,
    AccountDropdown,
    Help,
    Tickets,
    WebTerminal,
    SiteMessages,
    SystemSetting,
    Logo,
    Language,
    Search
  },
  data() {
    return {
      searchOpen: false
    }
  },
  computed: {
    ...mapGetters(['sidebar', 'publicSettings', 'currentOrgRoles', 'currentViewRoute', 'isMobile']),
    ticketsEnabled() {
      return (
        this.publicSettings['TICKETS_ENABLED'] &&
        this.$hasLicense() &&
        this.$hasPerm('tickets.view_ticket')
      )
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    orgsDisabled() {
      return this.$route.meta?.disableOrgsChange === true
    },
    orgsShow() {
      return this.$route.meta?.showOrganization !== false && this.$hasLicense()
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    handleSearchOpen(val) {
      // this.searchOpen = val
    }
  }
}
</script>
<style lang="scss" scoped>
@use '@/styles/variables' as *;

:global(.nav-header-dropdown.el-dropdown__popper .el-dropdown-menu) {
  padding: 10px 0;
  margin: 5px 0;
  border-radius: 4px;
}

:global(.nav-header-dropdown.el-dropdown__popper .el-dropdown-menu__item) {
  height: 36px;
  line-height: 36px;
  padding: 0 20px;
  font-size: 13px;
}

.navbar {
  position: relative;
  display: flex;
  align-items: center;
  min-height: $headerHeight;
  background-color: var(--banner-bg);

  ul {
    margin: 0;
    padding-inline-start: 0;
    list-style: none;
  }

  .is-show-menu {
    display: none;
  }

  .hamburger-container {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 25px;
    line-height: 25px;
    margin: 0 8px;
    padding: 1px 8px !important;
    border-radius: 5px;
    border-color: $color-primary;
    background-color: white;
    color: var(--text-primary);
    cursor: pointer;
    transition: 0.2s;
    opacity: 0.7;
  }

  .navbar-left {
    display: flex;
    align-items: stretch;
    flex: 1 1 auto;
    gap: 16px;
    min-width: 0;
    height: $headerHeight;

    .left-item {
      display: flex;
      align-items: center;
      flex: 0 0 auto;

      .nav-logo {
        display: flex;
        align-items: center;
        height: 100%;
        width: 200px;

        &:hover {
          background: rgba(0, 0, 0, 12%);
        }
      }

      &.organization-item {
        min-width: 0;
      }

      .organization {
        display: flex;
        align-items: center;
        min-width: 180px;
        max-width: min(360px, 28vw);
        height: 100%;
      }

      // 未找到与之对应的
      & :deep(.el-sub-menu__title) {
        font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
        padding: 0 8px;
        line-height: $headerHeight;
        height: $headerHeight;
      }

      // 未找到与之对应的
      & :deep(.svg-icon) {
        color: #fff !important;
      }
    }
  }

  .navbar-right {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    margin-left: auto;
    margin-right: 10px;
    height: $headerHeight;

    .header-item {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      height: 100%;
      line-height: 1;
      padding-right: 10px;
      padding-left: 10px;

      > * {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }

      & :deep(.svg-icon) {
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        color: #fff;
        font-size: 15px;
      }

      & :deep(.el-badge) {
        display: flex;
        align-items: center;
        height: 100%;
        vertical-align: top;

        .el-link {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          vertical-align: baseline;
        }

        .el-badge__content--primary {
          background-color: #fff;
        }

        .el-badge__content {
          top: 8px;
          height: 15px;
          line-height: 15px;
          border: none;
          color: var(--color-primary);
        }
      }

      & :deep(.el-link),
      & :deep(.el-dropdown),
      & :deep(.el-dropdown-link),
      & :deep(.el-tooltip__trigger),
      & :deep(.header-tools) {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }

      & :deep(i) {
        display: flex;
        align-items: center;
        line-height: 1;
        color: #fff;
        font-size: 16px;

        &.el-icon--right {
          font-size: 13px;
        }
      }

      & :deep(i.el-dialog__close) {
        color: #7c7e7f;
      }

      &.none-hover {
        padding: 0;

        &:hover {
          background: none;
        }
      }

      &:hover {
        background: rgba(0, 0, 0, 12%);
      }
    }
  }
}

@media screen and (max-width: 1006px) {
  .navbar {
    .navbar-left {
      display: none;
    }
  }
}

@media screen and (max-width: 480px) {
  .active-menu {
    display: none !important;
  }
}
</style>
