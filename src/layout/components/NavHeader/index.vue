<template>
  <div class="navbar">
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
    <hamburger
      :is-active="sidebar.opened"
      class="hamburger-container is-show-menu"
      @toggleClick="toggleSideBar"
    />
    <ul class="navbar-left">
      <li class="left-item">
        <div class="nav-logo">
          <Logo v-if="showLogo" :collapse="false" />
        </div>
      </li>
      <li v-if="orgsShow" class="left-item" style="margin-left: 20px">
        <Organization :disabled="orgsDisabled" class="organization" />
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
@import '~@/styles/variables.scss';

.navbar {
  position: relative;
  overflow: hidden;
  background-color: var(--banner-bg);

  ul {
    margin: 0;
    padding-inline-start: 0;
  }

  .is-show-menu {
    display: none;
  }

  .hamburger-container {
    float: left;
    height: 25px;
    line-height: 25px;
    margin: 8px;
    padding: 1px 8px !important;
    border-radius: 5px;
    border-color: $--color-primary;
    background-color: white;
    color: var(--text-primary);
    cursor: pointer;
    transition: 0.2s;
    opacity: 0.7;
  }

  .navbar-left {
    float: left;
    display: flex;
    height: 100%;

    .left-item {
      display: flex;
      align-items: center;
      list-style: none;

      .nav-logo {
        width: 200px;

        &:hover {
          background: rgba(0, 0, 0, 12%);
        }
      }

      .organization {
        display: flex;
        align-items: center;
        padding: 0 0 0 15px;
        border-radius: 3px;
        // background-color: rgba(5, 5, 5, 0.1);
        color: #fff;
        font-weight: 600;
        font-size: 15px;
        max-width: 250px;

        ::v-deep .el-input__inner {
          padding-left: 20px;
        }

        ::v-deep .el-input.is-disabled > input {
          background: none;
        }
      }

      // 未找到与之对应的
      & ::v-deep .el-submenu__title {
        font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
        padding: 0 8px;
        line-height: $headerHeight;
        height: $headerHeight;
      }

      // 未找到与之对应的
      & ::v-deep .svg-icon {
        color: #fff !important;
      }
    }
  }

  .navbar-right {
    display: flex;
    float: right;
    align-items: center;
    margin-right: 10px;

    .header-item {
      display: flex;
      line-height: $headerHeight;
      padding-right: 10px;
      padding-left: 10px;

      & ::v-deep .svg-icon {
        line-height: 40px;
        color: #eef3fb;
        font-size: 15px;
      }

      & ::v-deep .el-badge {
        vertical-align: top;

        .el-link {
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

      & ::v-deep i {
        color: #eef3fb;
        font-size: 16px;

        &.el-icon-arrow-down {
          font-size: 13px;
        }
      }

      & ::v-deep i.el-dialog__close.el-icon-close {
        color: #7c7e7f;
      }

      &.none-hover {
        padding: 0;
        &:hover {
          background: none;
        }
      }

      &:hover {
        background: rgba(255, 255, 255, 0.08);
      }
    }
  }
}

@media screen and (max-width: 1006px) {
  .navbar {
    .is-show-menu {
      display: block;
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
