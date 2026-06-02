<template>
  <div class="navbar">
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
    <hamburger
      :is-active="sidebar.opened"
      class="hamburger-container is-show-menu"
      @toggle-click="toggleSideBar"
    />
    <ul class="navbar-right">
      <li class="header-item header-icon none-hover">
        <Search @search-open="handleSearchOpen" />
      </li>
      <li class="header-item header-icon">
        <el-tooltip :content="$tc('SiteMessageList')" :open-delay="500" effect="dark">
          <SiteMessages />
        </el-tooltip>
      </li>
      <li v-perms="['rbac.view_webterminal']" class="header-item header-icon">
        <el-tooltip :content="$tc('WebTerminal')" :open-delay="500" effect="dark">
          <WebTerminal />
        </el-tooltip>
      </li>
      <li v-if="ticketsEnabled" class="header-item header-hover">
        <el-tooltip :content="$tc('Ticket')" :open-delay="500" effect="dark">
          <Tickets />
        </el-tooltip>
      </li>
      <li v-perms="'settings.view_setting'" class="header-item header-icon">
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

.navbar {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  height: $headerHeight;
  overflow: visible;
  background-color: var(--banner-bg);

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    padding-inline-start: 0;
  }

  .is-show-menu {
    display: none;
  }

  .hamburger-container {
    align-items: center;
    justify-content: center;
    height: 28px;
    min-width: 34px;
    margin: 0 var(--space-2);
    padding: 0 var(--space-2) !important;
    border-radius: var(--radius-control);
    border-color: $color-primary;
    background-color: white;
    color: var(--text-primary);
    cursor: pointer;
    transition:
      background-color var(--duration-fast) var(--ease-standard),
      opacity var(--duration-fast) var(--ease-standard);
    opacity: 0.7;
  }

  .navbar-left {
    display: flex;
    align-items: center;
    flex: 1 1 auto;
    min-width: 0;
    height: 100%;

    .left-item {
      display: flex;
      align-items: center;
      height: 100%;
      list-style: none;

      &.organization-item {
        flex: 0 0 128px;
        width: 128px;
        min-width: 128px;
        margin-left: var(--space-3);
      }

      .nav-logo {
        display: flex;
        align-items: center;
        width: 200px;
        height: 100%;

        &:hover {
          background: rgba(0, 0, 0, 12%);
        }
      }

      .organization {
        display: flex;
        align-items: center;
        height: 32px;
        width: 128px !important;
        min-width: 128px;
        max-width: 128px;
        padding: 0;
        border-radius: var(--radius-control);
        color: #fff;
        font-weight: var(--font-weight-medium);
        font-size: var(--font-size-md);

        :deep(.el-input__inner) {
          padding-left: 20px;
        }

        :deep(.el-select__placeholder),
        :deep(.el-select__selected-item),
        :deep(.el-select__selected-item span) {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        :deep(.el-input.is-disabled > input) {
          background: none;
        }

        &:hover {
          background: transparent;
        }
      }

      // 未找到与之对应的
      & :deep(.el-sub-menu__title) {
        font-family: var(--font-family-base);
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
    justify-content: flex-end;
    flex: 0 0 auto;
    gap: var(--space-1);
    height: 100%;
    margin-left: auto;
    margin-right: var(--space-2);

    .header-item {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-width: 32px;
      padding: 0 var(--space-2);
      line-height: 1;
      list-style: none;

      :deep(.global-search),
      :deep(.header-tools),
      :deep(.el-dropdown),
      :deep(.el-dropdown-link),
      :deep(.el-link),
      :deep(.el-badge),
      :deep(.el-tooltip__trigger) {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      }

      :deep(.el-dropdown-link) {
        gap: var(--space-1);
      }

      & :deep(.svg-icon) {
        display: inline-block;
        width: 16px;
        height: 16px;
        line-height: 16px;
        color: #fff;
        font-size: 16px;
      }

      & :deep(.el-badge) {
        height: 20px;
        vertical-align: middle;

        .el-link {
          height: 20px;
          vertical-align: middle;
        }

        .el-badge__content--primary {
          background-color: #fff;
        }

        .el-badge__content {
          top: 0;
          height: 15px;
          line-height: 15px;
          border: none;
          color: var(--color-primary);
        }
      }

      & :deep(i) {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 16px;
        line-height: 16px;

        &.el-icon-arrow-down {
          font-size: 13px;
        }
      }

      & :deep(i.el-dialog__close.el-icon-close) {
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
    .is-show-menu {
      display: inline-flex;
    }

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
