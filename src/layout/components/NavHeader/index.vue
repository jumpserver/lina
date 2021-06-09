<template>
  <div class="navbar">
    <div class="navbar-header">
      <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    </div>
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Hamburger from '@/components/Hamburger'
import AccountDropdown from './AccountDropdown'
import SiteMessages from './SiteMessages'
import Help from './Help'
import Language from './Language'
import WebTerminal from './WebTerminal'
import Tickets from './Tickets'
import rolc from '@/utils/role'

export default {
  components: {
    // Breadcrumb,
    Hamburger,
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
      return rolc.getRolesDisplay(this.currentOrgRoles).includes('OrgAuditor') || rolc.getRolesDisplay(this.currentOrgRoles).includes('Auditor')
    },
    showTickets() {
      return this.publicSettings.TICKETS_ENABLED &&
        this.publicSettings.XPACK_LICENSE_IS_VALID &&
        !this.isOrgAuditor
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
  .navbar {
    height: 50px;
    overflow: hidden;
    position: relative;
    background: #f3f3f4;
    box-shadow: 0 1px 4px rgba(0, 21, 41, .08);

    .hamburger-container {
      line-height: 46px;
      height: 100%;
      float: left;
      cursor: pointer;
      transition: background .3s;
      -webkit-tap-highlight-color: transparent;
      padding-left: 20px;
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

    .breadcrumb-container {
      float: left;
      padding-left: 20px;
    }

  }
  .el-header {
    background-color: #ffffff;
  }

  ul {
    margin: 0;
  }
</style>

