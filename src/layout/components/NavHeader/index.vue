<template>
  <div class="navbar">
    <div class="navbar-header">
      <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
      <breadcrumb class="breadcrumb-container" />
    </div>
    <div class="navbar-right">
      <div class="">
        <el-dropdown trigger="click">
        <span class="el-dropdown-link">
          下拉菜单 <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item icon="el-icon-plus">黄金糕</el-dropdown-item>
            <el-dropdown-item icon="el-icon-circle-plus">狮子头</el-dropdown-item>
            <el-dropdown-item icon="el-icon-circle-plus-outline">螺蛳粉</el-dropdown-item>
            <el-dropdown-item icon="el-icon-check">双皮奶</el-dropdown-item>
            <el-dropdown-item icon="el-icon-circle-check">蚵仔煎</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>

    </div>

    <!--    <el-menu class="el-menu-demo" mode="horizontal">-->
    <!--      <el-menu-item index="0"></el-menu-item>-->
    <!--      <el-menu-item index="1"><breadcrumb class="breadcrumb-container" /></el-menu-item>-->
    <!--      <el-submenu index="2" class="el-submenu-right">-->
    <!--        <template slot="title">-->
    <!--          <img-->
    <!--            src="@/assets/img/admin.png"-->
    <!--            class="header-menu-logo"-->
    <!--            style="height:30px;weight:30px;border-radius: 50%;margin-right:5px;"-->
    <!--          >管理员-->
    <!--        </template>-->
    <!--        <el-menu-item index="2-1">个人信息</el-menu-item>-->
    <!--        <el-menu-item index="2-2">用户界面</el-menu-item>-->
    <!--        <el-menu-item index="2-2">API key</el-menu-item>-->
    <!--        <el-menu-item index="2-2">注销登录</el-menu-item>-->
    <!--      </el-submenu>-->
    <!--      <el-dropdown trigger="click">-->
    <!--      <span class="el-dropdown-link">-->
    <!--        下拉菜单<i class="el-icon-arrow-down el-icon--right"></i>-->
    <!--      </span>-->
    <!--        <el-dropdown-menu slot="dropdown">-->
    <!--          <el-dropdown-item icon="el-icon-plus">中文</el-dropdown-item>-->
    <!--          <el-dropdown-item icon="el-icon-circle-plus">英文</el-dropdown-item>-->
    <!--        </el-dropdown-menu>-->
    <!--      </el-dropdown>-->
    <!--      <el-submenu index="3" class="el-submenu-right">-->
    <!--        <template slot="title" style="font-weight:600;"><i class="fa fa-globe header-menu-icon" style="margin-right:5px;" />{{ $t('header.language') }}</template>-->
    <!--        <el-menu-item index="3-1" @click="changeLangToZH()">中文</el-menu-item>-->
    <!--        <el-menu-item index="3-2" @click="changeLangToEnglish()">English</el-menu-item>-->
    <!--      </el-submenu>-->
    <!--      <el-submenu index="4" class="el-submenu-right">-->
    <!--        <template slot="title"><i class="fa fa-handshake-o header-menu-icon" style="margin-right:5px;" />{{ $t('header.help') }}</template>-->
    <!--        <el-menu-item index="4-1">{{ $t('header.Documents') }}</el-menu-item>-->
    <!--        <el-menu-item index="4-2">{{ $t('header.CommercialSupport') }}</el-menu-item>-->
    <!--      </el-submenu>-->
    <!--    </el-menu>-->
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'

export default {
  components: {
    Breadcrumb,
    Hamburger
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
  .el-header{
    background-color: #ffffff;
    //border-bottom: 1px solid #e7eaec !important;
  }
  .el-submenu-right{
    float: right !important;
  }
  //重置Font-weight
  .el-submenu-right /deep/ .el-submenu__title{
    font-weight: 600;
    border-bottom: 0px !important;
    color: #888888 !important;
  }
  //重置导航菜单选中样式
  .el-menu--horizontal>.el-menu-item.is-active {
    border-bottom: 0px;
  }
  .el-menu--horizontal>.el-menu-item{
    height: 50px;
    line-height: 50px;
  }
  .el-submenu-right /deep/ .el-submenu__title{
    height: 50px;
    padding: 0 20px !important;
    line-height: 50px;
  }
</style>

<style lang="scss" scoped>
  .navbar {
    height: 50px;
    overflow: hidden;
    position: relative;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0,21,41,.08);

    .hamburger-container {
      line-height: 50px;
      height: 100%;
      float: left;
      cursor: pointer;
      transition: background .3s;
      -webkit-tap-highlight-color:transparent;
      padding-left: 20px;
    }

    .navbar-right {
      float: right;
      /*<!--margin-right: -15px;-->*/
    }

    .breadcrumb-container {
      float: left;
    }

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
  }
</style>
