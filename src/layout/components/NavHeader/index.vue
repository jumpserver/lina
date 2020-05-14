<template>
  <div class="navbar">
    <div class="navbar-header">
      <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    </div>
    <div class="navbar-right">
      <div class="header-item">
        <el-dropdown>
          <span class="el-dropdown-link">
            {{ $t('common.nav.Help') }}<i class="el-icon-arrow-down el-icon--right" />
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item icon="el-icon-plus">{{ $t('common.nav.Docs') }}</el-dropdown-item>
            <el-dropdown-item icon="el-icon-circle-plus">{{ $t('common.nav.Support') }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="header-item">
        <el-dropdown>
          <span class="el-dropdown-link">
            {{ currentLang.title }}<i class="el-icon-arrow-down el-icon--right" />
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="item of supportLanguages" :key="item.code" @click.native="changeLangTo(item)">{{ item.title }}</el-dropdown-item>
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
  data() {
    return {
      LANG_COOKIE_NAME: 'django_language',
      supportLanguages: [
        {
          title: '中文(简体)',
          code: 'cn',
          cookieCode: 'zh-hans'
        },
        {
          title: 'English',
          code: 'en',
          cookieCode: 'en'
        }
      ]
    }
  },
  computed: {
    ...mapGetters([
      'sidebar'
    ]),
    currentLang() {
      const cookieCode = this.$cookie.get(this.LANG_COOKIE_NAME)
      let lang = this.supportLanguages.find((v) => v.cookieCode === cookieCode)
      if (!lang) {
        lang = this.supportLanguages[0]
        this.changeLangTo(lang)
      }
      return lang
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('users/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    changeLangTo(item) {
      this.$i18n.locale = item.code
      localStorage.setItem('lang', item.code)
      this.$cookie.set(this.LANG_COOKIE_NAME, item.cookieCode)
      window.location.reload()
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

