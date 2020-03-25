<template>
  <div class="navbar">
    <div class="navbar-header">
      <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
<!--      <breadcrumb class="breadcrumb-container" />-->
    </div>
    <div class="navbar-right">
      <div class="header-item">
        <el-dropdown>
          <span class="el-dropdown-link">
            {{ $t('common.Help') }}<i class="el-icon-arrow-down el-icon--right" />
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item icon="el-icon-plus">{{ $t('Docs') }}</el-dropdown-item>
            <el-dropdown-item icon="el-icon-circle-plus">{{ $t('Support') }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="header-item">
        <el-dropdown>
          <span class="el-dropdown-link">
            {{ $t('common.Language') }}<i class="el-icon-arrow-down el-icon--right" />
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>中文(简体)</el-dropdown-item>
            <el-dropdown-item>English</el-dropdown-item>
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
// import Breadcrumb from '@/components/Breadcrumb'
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
    },
    changeLangToEnglish() {
      this.$i18n.locale = 'en'
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
      line-height: 50px;
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

    /*
    .right-menu {
      float: right;
      height: 100%;
      line-height: 50px;

      &:focus {
        outline: none;
      }

      .right-menu-item {
        display: inline-block;
        padding: 0 8px;
        height: 100%;
        font-size: 18px;
        color: #5a5e66;
        vertical-align: text-bottom;

        &.hover-effect {
          cursor: pointer;
          transition: background .3s;

          &:hover {
            background: rgba(0, 0, 0, .025)
          }
        }
      }

      .avatar-container {
        margin-right: 30px;

        .avatar-wrapper {
          margin-top: 5px;
          position: relative;

          .user-avatar {
            cursor: pointer;
            width: 40px;
            height: 40px;
            border-radius: 10px;
          }

          .el-icon-caret-bottom {
            cursor: pointer;
            position: absolute;
            right: -20px;
            top: 25px;
            font-size: 12px;
          }
        }
      }
    }
     */
  }
  .el-header {
    background-color: #ffffff;
  }
</style>

