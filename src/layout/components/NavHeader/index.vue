<template>
  <div class="navbar">
    <div class="navbar-header">
      <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    </div>
    <div class="navbar-right">
      <div class="header-item">
        <Help />
      </div>
      <div class="header-item">
        <Language />
      </div>
      <div class="header-item">
        <WebTerminal />
      </div>
      <div class="header-item header-profile">
        <AccountDropdown />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Hamburger from '@/components/Hamburger'
import AccountDropdown from './AccountDropdown'
import Help from './Help'
import Language from './Language'
import WebTerminal from './WebTerminal'

export default {
  components: {
    // Breadcrumb,
    Hamburger,
    AccountDropdown,
    Language,
    Help,
    WebTerminal
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'sidebar'
    ])
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
    }

    .header-item {
      line-height: 50px;
      display: inline-block;
      padding-right: 20px;
    }

    .breadcrumb-container {
      float: left;
      padding-left: 20px;
    }

  }
  .el-header {
    background-color: #ffffff;
  }
</style>

