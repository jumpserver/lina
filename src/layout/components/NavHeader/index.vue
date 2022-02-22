<template>
  <div class="navbar">
    <ul class="navbar-right">
      <li class="header-item header-icon">
        <el-tooltip effect="dark" :content="this.$t('route.SiteMessageList')">
          <SiteMessages />
        </el-tooltip>
      </li>
      <li class="header-item header-icon">
        <el-tooltip effect="dark" :content="this.$t('route.WebTerminal')">
          <WebTerminal />
        </el-tooltip>
      </li>
      <li v-perms="'settings.change_setting'" class="header-item header-icon">
        <el-tooltip effect="dark" :content="this.$t('route.SystemSetting')">
          <SystemSetting />
        </el-tooltip>
      </li>
      <li class="header-item header-hover">
        <Tickets />
      </li>
      <li class="header-item">
        <Help />
      </li>
      <li class="header-item header-profile">
        <AccountDropdown />
      </li>
    </ul>
    <ul class="navbar-left">
      <li class="left-item">
        <ViewSwitcher />
      </li>
      <li v-show="showOrganize()" class="left-item" style="margin-left: 12px">
        <Organization class="organization" />
      </li>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import Hamburger from '@/components/Hamburger'
import AccountDropdown from './AccountDropdown'
import SiteMessages from './SiteMessages'
import Help from './Help'
import WebTerminal from './WebTerminal'
import Tickets from './Tickets'
import ViewSwitcher from './ViewSwitcher'
import Organization from './Organization'
import SystemSetting from './SystemSetting'

export default {
  components: {
    ViewSwitcher,
    Organization,
    AccountDropdown,
    Help,
    Tickets,
    WebTerminal,
    SiteMessages,
    SystemSetting
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'sidebar', 'publicSettings', 'currentOrgRoles', 'currentViewRoute'
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    showOrganize() {
      return this.$route.meta?.showOrganization !== false
    }
  }
}
</script>
<style lang="scss" scoped>
  .navbar {
    height: 55px;
    overflow: hidden;
    background: #f3f3f4;

    .navbar-left {
      float: left;

      .left-item {
        line-height: 55px;
        display: inline-block;
        vertical-align: middle;
        &>>> .el-submenu__title {
          font-family: "open sans","Helvetica Neue",Helvetica,Arial,sans-serif;
          padding: 0 14px;
        }
        &>>> .org-select {
          padding: 0;
        }
      }
    }

    .navbar-right {
      float: right;
      margin-right: 10px;

      .header-hover {
        &:hover {
          background-color: #e6e6e6;
        }
      }

      .header-item {
        line-height: 55px;
        display: inline-block;
        padding-right: 10px;
        padding-left: 10px;
        vertical-align: middle;
      }

      .header-icon {
        padding-left: 8px;
        padding-right: 8px;
        &:hover {
          background-color: #e6e6e6;
        }
        &>>> i {
          color: #909399;
          font-size: 16px;
        }
        &>>> .svg-icon {
          font-size: 16px;
          color: #909399;
        }
      }
    }
  }

  ul {
    margin: 0;
    padding-inline-start: 0;
  }

</style>

