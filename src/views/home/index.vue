<template>
  <div class="home">
    <NavHeader />
    <el-container class="container">
      <el-main class="main">
        <div class="content">
          <div class="content-body">
            <el-row>
              <el-col :span="16" class="public-height" style="padding-right: 20px;">
                <Log />
                <Assect />
                <Ticket />
              </el-col>
              <el-col :span="8" class="public-height">
                <User />
                <Announcement />
              </el-col>
            </el-row>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { NavHeader } from '@/layout/components'
import User from './components/User'
import Announcement from './components/Announcement'
import Ticket from './components/Ticket'
import Log from './components/Log'
import Assect from './components/Assect'

export default {
  name: 'Name',
  components: {
    NavHeader,
    User,
    Announcement,
    Ticket,
    Log,
    Assect
  },
  computed: {
    getasValidLicense() {
      return this.$store.getters.hasValidLicense
    }
  }
}

</script>

<style lang="scss" scoped>
  @import "~@/styles/mixin.scss";
  @import "~@/styles/variables.scss";

  .home {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;
    .container {
      position: relative;
      height: calc(100% - 55px);
      background-color: #f3f4f7;
      .main {
        position: relative;
        height: 100%;
        &::before {
          position: absolute;
          top: 0px;
          left: 0px;
          content: "";
          transition: opacity 0.4s ease-out 0s;
          display: block;
          opacity: 1;
          width: 100%;
          height: 200px;
          background-image: url("../../assets/img/header-profile.png");
          background-size: auto 100%;
          background-position: center top;
          background-color: rgb(14, 22, 33);
        }
        .content {
          position: relative;
          top: 50px;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          .content-body {
            height: 100%;
            width: 100%;
            max-width: 1360px;
            margin: 0 auto;
          }
        }
      }
    }
  }
  .public-height {
    height: 100%;
  }
  .public-wigth {
    width: 100%;
  }
  .public-box {
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 2px 4px 0 rgb(54 58 80 / 32%);
    width: 100%;
  }

</style>
