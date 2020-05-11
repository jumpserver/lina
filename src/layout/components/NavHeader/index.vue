<template>
  <div class="navbar">
    <div class="navbar-header">
      <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    </div>
    <div class="navbar-right">
      <div class="header-item">
        <el-dropdown>
          <span class="el-dropdown-link">
            {{ $ttc('help') }}<i class="el-icon-arrow-down el-icon--right" />
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item icon="el-icon-plus">{{ $ttc('docs') }}</el-dropdown-item>
            <el-dropdown-item icon="el-icon-circle-plus">{{ $ttc('support') }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="header-item">
        <el-dropdown>
          <span class="el-dropdown-link">
            {{ $ttc('language') }}<i class="el-icon-arrow-down el-icon--right" />
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="changeLangToZH">中文(简体)</el-dropdown-item>
            <el-dropdown-item @click.native="changeLangToEnglish">English</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
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

export default {
  components: {
    // Breadcrumb,
    Hamburger,
    AccountDropdown
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar'
    ])
  },
  data() {
    return {
      LANG_COOKIE_NAME: 'django_language'
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    changeLangToZH() {
      this.$i18n.locale = 'cn'
      localStorage.setItem('lang', 'cn')
      this.$cookie.set(this.LANG_COOKIE_NAME, 'zh-hans')
    },
    changeLangToEnglish() {
      this.$i18n.locale = 'en'
      localStorage.setItem('lang', 'en')
      this.$cookie.set(this.LANG_COOKIE_NAME, 'en')
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

