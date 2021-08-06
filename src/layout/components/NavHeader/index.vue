<template>
  <div class="navbar">
    <ul class="navbar-right">
      <li class="header-item header-icon">
        <SiteMessages />
      </li>
      <li class="header-item" style="margin-left: 10px">
        <Help />
      </li>
      <li class="header-item">
        <Language />
      </li>
      <li v-if="showTickets" class="header-item">
        <Tickets />
      </li>
      <li class="header-item">
        <WebTerminal />
      </li>
      <li class="header-item header-profile">
        <AccountDropdown />
      </li>
    </ul>
    <div class="navbar-left">
      <el-menu
        default-active="activeIndex"
        class="menu-main"
        mode="horizontal"
        @select="handleSelectView"
      >
        <el-submenu index="2">
          <template slot="title">
            <span style="font-size: 14px"><i class="fa fa-bars" /> 管理视图</span>
          </template>
          <el-menu-item index="admin">管理视图</el-menu-item>
          <el-menu-item index="audit">审计视图</el-menu-item>
          <el-menu-item index="user">用户视图</el-menu-item>
        </el-submenu>
      </el-menu>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import Hamburger from '@/components/Hamburger'
import AccountDropdown from './AccountDropdown'
import SiteMessages from './SiteMessages'
import Help from './Help'
import Language from './Language'
import WebTerminal from './WebTerminal'
import Tickets from './Tickets'
import rolc from '@/utils/role'
import store from '@/store'

export default {
  components: {
    // Breadcrumb,
    // Hamburger,
    AccountDropdown,
    Language,
    Help,
    Tickets,
    WebTerminal,
    SiteMessages
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'sidebar', 'publicSettings', 'currentOrgRoles'
    ]),
    isOrgAuditor() {
      return rolc.getRolesDisplay(this.currentOrgRoles).includes('OrgAuditor') ||
        rolc.getRolesDisplay(this.currentOrgRoles).includes('Auditor')
    },
    showTickets() {
      return this.publicSettings['TICKETS_ENABLED'] &&
        this.publicSettings['XPACK_LICENSE_IS_VALID'] &&
        !this.isOrgAuditor
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    handleSelectView(key, keyPath) {
      const mapper = {
        admin: 'AdminView',
        user: 'UserView',
        audit: 'AuditView'
      }
      const fromRoute = this.$route
      this.$router.push({ name: mapper[key] || 'AdminView' }, () => {
        store.dispatch('permission/generateViewRoutes', { to: this.$route, from: fromRoute })
      })
      console.log('Key: ', key)
    }
  }
}
</script>
<style lang="scss" scoped>
  .navbar {
    height: 50px;
    overflow: hidden;
    position: relative;
    background: #f3f3f4;
    box-shadow: 0 1px 4px rgba(0, 21, 41, .08);

    .navbar-left {
      width: 100px;

      .menu-main.el-menu {
        background-color: transparent;

        .el-submenu.is-opened {
          background-color: transparent;
        }
      }
    }

    .navbar-right {
      float: right;
      margin-right: 10px;

      .header-item {
        line-height: 50px;
        display: inline-block;
        padding-right: 10px;
        padding-left: 10px;
      }

      .header-icon {
        &:hover {
          background-color: #e6e6e6;
        }
      }
    }
  }

  ul {
    margin: 0;
  }
</style>

