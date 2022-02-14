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
      <li class="header-item">
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

export default {
  components: {
    ViewSwitcher,
    Organization,
    AccountDropdown,
    Help,
    Tickets,
    WebTerminal,
    SiteMessages
  },
  data() {
    return {
      routeViews: []
    }
  },
  computed: {
    ...mapGetters([
      'sidebar', 'publicSettings', 'currentOrgRoles', 'currentViewRoute'
    ])
  },
  created() {
    this.$store.dispatch('permission/getFilterRoutes').then(res => {
      this.routeViews = res.filter((i) => {
        return i?.perms.length > 0 && i?.route !== 'UserView'
      })
    })
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

    .organization {
      height: 35px;
      line-height: 35px;
      background: #E0E0E0;
      border-radius: 19px;
      color: #606266;
      //margin-right: -15px;
      &:after {
        position: absolute;
        top: 15%;
        left: -16px;
        content: '';
        width: 1px;
        height: 25px;
        background-color: rgba(144,147,152,.5);
      }
      &>>> .el-input__prefix {
        left: 8px
      }
      &>>> .el-input--prefix .el-input__inner {
        line-height: 35px !important;
        height: 35px !important;
      }
      &>>> .fa-sitemap {
        padding-left: 4px;
      }
      &>>> .el-input__icon {
        color: #606266;
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
      &:hover {
        background-color: #e6e6e6;
      }
      &>>> .el-badge {
        vertical-align: sub;
      }
    }

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
    }
  }

  ul {
    margin: 0;
    padding-inline-start: 0;
  }
</style>

