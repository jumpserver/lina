<template>
  <div class="navbar">
    <ul class="navbar-right">
      <li class="header-item header-icon">
        <el-tooltip effect="dark" :content="$tc('route.SiteMessageList')">
          <SiteMessages />
        </el-tooltip>
      </li>
      <li v-perms="['rbac.view_webterminal']" class="header-item header-icon">
        <el-tooltip effect="dark" :content="$tc('route.WebTerminal')">
          <WebTerminal />
        </el-tooltip>
      </li>
      <li v-perms="'settings.view_setting'" class="header-item header-icon">
        <el-tooltip effect="dark" :content="$tc('route.SystemSetting')">
          <SystemSetting />
        </el-tooltip>
      </li>
      <li v-if="ticketsEnabled" class="header-item header-hover">
        <el-tooltip effect="dark" :content="$tc('route.Ticket')">
          <Tickets />
        </el-tooltip>
      </li>
      <li class="header-item active-menu">
        <Help />
      </li>
      <li class="header-item header-profile">
        <AccountDropdown />
      </li>
    </ul>
    <hamburger :is-active="sidebar.opened" class="hamburger-container is-show-menu" @toggleClick="toggleSideBar" />
    <ul class="navbar-left">
      <li class="left-item">
        <div class="nav-logo">
          <Logo v-if="showLogo" :collapse="false" />
        </div>
      </li>
      <li v-if="showOrganize()" class="left-item" style="margin-left: 21px">
        <Organization class="organization" />
      </li>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Hamburger from '@/components/Hamburger'
import AccountDropdown from './AccountDropdown'
import SiteMessages from './SiteMessages'
import Help from './Help'
import WebTerminal from './WebTerminal'
import Tickets from './Tickets'
import Organization from './Organization'
import SystemSetting from './SystemSetting'
import Logo from '../NavLeft/Logo'

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
    Logo
  },
  data() {
    return {}
  },
  computed: {
    ...mapGetters([
      'sidebar', 'publicSettings', 'currentOrgRoles', 'currentViewRoute'
    ]),
    ticketsEnabled() {
      return this.publicSettings['TICKETS_ENABLED'] &&
        this.$hasLicense() &&
        this.$hasPerm('tickets.view_ticket')
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    showOrganize() {
      return (this.$route.meta?.showOrganization !== false) && this.$hasLicense()
    }
  }
}
</script>
<style lang="scss" scoped>
  @import "~@/styles/variables.scss";

  $header-height: 50px;
  .navbar {
    position: relative;
    height: $header-height;
    line-height: $header-height;
    overflow: hidden;
    background: var(--color-primary);

    .navbar-left {
      float: left;

      .left-item {
        line-height: $header-height;
        display: inline-block;
        vertical-align: middle;

        & >>> .el-submenu__title {
          font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
          padding: 0 8px;
          line-height: $header-height;
          height: $header-height;
        }

        & >>> .org-select {
          padding: 0;
        }
        .nav-logo {
          width: 200px;
        }
      }
    }

    .navbar-right {
      float: right;
      margin-right: 10px;

      .header-hover {
        &:hover {
          background-color: rgba(255, 255, 255, .2);
        }
      }

      .header-item {
        line-height: $header-height;
        display: inline-block;
        padding-right: 10px;
        padding-left: 10px;
        vertical-align: middle;
        &>>> .svg-icon {
          color: #FFF!important;
        }
      }

      .header-icon {
        padding-left: 8px;
        padding-right: 8px;

        &:hover {
          background-color: rgba(255, 255, 255, .2);
        }

        & >>> i {
          color: #FFF;
          font-size: 16px;
        }

        & >>> .svg-icon {
          color: #FFF;
          font-size: 16px;
        }
      }
    }
  }

  ul {
    margin: 0;
    padding-inline-start: 0;
  }

  .is-show-menu {
    display: none;
  }

  .hamburger-container {
    float: left;
    height: 26px;
    margin: 12px;
    padding: 0 10px !important;
    line-height: 30px;
    border-radius: 4px;
    border-color: $--color-primary;
    background-color: $--color-primary;
    color: #fff;
    cursor: pointer;
    transition: .2s;
    -webkit-tap-highlight-color: transparent;

    & >>> .svg-icon {
      font-size: 16px!important;
      color: #fff!important;
    }
  }

  @media screen and (max-width: 1006px) {
    .is-show-menu {
      display: block;
    }
    .navbar-left {
      display: none;
    }
  }

  @media screen and (max-width: 480px) {
    .active-menu {
      display: none !important;;
    }
  }
</style>

