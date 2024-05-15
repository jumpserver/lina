<template>
  <div class="navbar">
    <ul class="navbar-right">
      <li class="header-item header-icon">
        <el-tooltip :content="$tc('SiteMessageList')" effect="dark">
          <SiteMessages />
        </el-tooltip>
      </li>
      <li v-perms="['rbac.view_webterminal']" class="header-item header-icon">
        <el-tooltip :content="$tc('WebTerminal')" effect="dark">
          <WebTerminal />
        </el-tooltip>
      </li>
      <li v-if="ticketsEnabled" class="header-item header-hover">
        <el-tooltip :content="$tc('Ticket')" effect="dark">
          <Tickets />
        </el-tooltip>
      </li>
      <li v-perms="'settings.view_setting'" class="header-item header-icon">
        <el-tooltip :content="$tc('SystemSetting')" effect="dark">
          <SystemSetting />
        </el-tooltip>
      </li>
      <li class="header-item active-menu">
        <Help />
      </li>
      <li class="header-item">
        <Language />
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
      <li v-if="orgsShow" class="left-item" style="margin-left: 20px;">
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
    Language
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
    },
    orgsDisabled() {
      return this.$route.meta?.disableOrgsChange === true
    },
    orgsShow() {
      return (this.$route.meta?.showOrganization !== false) && this.$hasLicense()
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

.navbar {
  position: relative;
  height: $headerHeight;
  line-height: $headerHeight;
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
    height: 30px;
    margin: 5px;
    padding: 0 10px !important;
    line-height: 30px;
    border-radius: 5px;
    border-color: $--color-primary;
    background-color: white;
    color: #fff;
    cursor: pointer;
    transition: .2s;
    -webkit-tap-highlight-color: transparent;
    opacity: 0.7;

    ::v-deep .svg-icon {
      font-size: 16px !important;
      color: #fff !important;
    }
  }

  // 折叠按钮
  .hamburger-container {
    float: left;
    height: 30px;
    margin: 5px;
    padding: 0 10px !important;
    line-height: 30px;
    border-radius: 5px;
    border-color: $--color-primary;
    background-color: white;
    color: #fff;
    cursor: pointer;
    transition: .2s;
    -webkit-tap-highlight-color: transparent;
    opacity: 0.7;

    ::v-deep .svg-icon {
      font-size: 16px !important;
      color: #fff !important;
    }
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
        line-height: 30px;
        padding: 0 10px 0 15px !important;
        border-radius: 5px;
        background-color: rgba(255, 255, 255, .15);
        color: #fff;
        font-weight: 600;
        font-size: 15px;

        &:hover {
          background-color: rgba(0, 0, 0, .12) !important;
        }
      }

      // 未找到与之对应的
      & >>> .el-submenu__title {
        font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
        padding: 0 8px;
        line-height: $headerHeight;
        height: $headerHeight;
      }

      // 未找到与之对应的
      & >>> .svg-icon {
        color: #FFF !important;
      }
    }
  }

  .navbar-right {
    display: flex;
    float: right;
    align-items: center;
    margin-right: 10px;
    height: $headerHeight;
    line-height: $headerHeight;

    .header-item {
      line-height: $headerHeight;
      display: inline-block;
      padding-right: 10px;
      padding-left: 10px;
      vertical-align: top;

      & >>> .svg-icon {
        line-height: 40px;
        color: #FFF !important;
        font-size: 16px;
      }

      & >>> .el-badge {
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

      & >>> i {
        color: #FFF;
        font-size: 16px;

        &.el-icon-arrow-down {
          font-size: 13px;
        }
      }

      & >>> i.el-dialog__close.el-icon-close {
        color: #7c7e7f;
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
      display: block;
    }
    .navbar-left {
      display: none;
    }
  }
}

@media screen and (max-width: 480px) {
  .active-menu {
    display: none !important;;
  }
}
</style>
