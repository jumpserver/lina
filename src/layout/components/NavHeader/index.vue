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
            <span style="font-size: 14px"><i class="fa fa-bars" /> {{ viewName }}</span>
          </template>
          <el-menu-item
            v-for="view of views"
            :key="view.name"
            v-perms="view.perms"
            :index="view.name"
          >{{ view.label }}</el-menu-item>
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
      views: [
        {
          name: 'admin',
          label: '管理视图',
          route: 'AdminView',
          perms: ['admin']
        },
        {
          name: 'audit',
          label: '审计视图',
          route: 'AuditView',
          perms: ['assets.add_systemuser']
        },
        {
          name: 'user',
          label: '用户视图',
          route: 'UserView',
          perms: ['use']
        }
      ]
    }
  },
  computed: {
    ...mapGetters([
      'sidebar', 'publicSettings', 'currentOrgRoles', 'currentViewRoute'
    ]),
    isOrgAuditor() {
      return rolc.getRolesDisplay(this.currentOrgRoles).includes('OrgAuditor') ||
        rolc.getRolesDisplay(this.currentOrgRoles).includes('Auditor')
    },
    showTickets() {
      return this.publicSettings['TICKETS_ENABLED'] &&
        this.publicSettings['XPACK_LICENSE_IS_VALID'] &&
        !this.isOrgAuditor
    },
    viewsMapper() {
      const mapper = {}
      for (const view of this.views) {
        mapper[view.name] = view
      }
      return mapper
    },
    viewName() {
      const viewName = this.currentViewRoute?.meta?.view
      const name = this.viewsMapper[viewName]?.label
      return name
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    handleSelectView(key, keyPath) {
      const routeName = this.viewsMapper[key]?.route || 'AdminView'
      const fromRoute = this.$route
      this.$router.push({ name: routeName }, () => {
        store.dispatch('permission/generateViewRoutes', { to: this.$route, from: fromRoute })
      })
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

