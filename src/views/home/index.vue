<template>
  <div class="home">
    <NavHeader />
    <el-container class="container">
      <el-main class="main">
        <div class="content">
          <div class="content-body">
            <el-row>
              <el-col :span="16" style="padding-right: 20px;">
                <Log />
                <Session />
                <Assect />
                <Ticket />
              </el-col>
              <el-col :span="8">
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
import store from '@/store'
import { NavHeader } from '@/layout/components'
import User from './components/User'
import Announcement from './components/Announcement'
import Ticket from './components/Ticket'
import Log from './components/Log'
import Assect from './components/Assect'
import Session from './components/Session'

export default {
  name: 'Name',
  components: {
    NavHeader,
    User,
    Announcement,
    Ticket,
    Log,
    Assect,
    Session
  },
  data() {
    return {
      rootShow: true
    }
  },
  computed: {
    getasValidLicense() {
      return this.$store.getters.hasValidLicense
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      store.dispatch('permission/getRootPerms', 'aaaa').then(res => {
        this.rootShow = res
      })
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
      // background-color: #f3f4f7;
      background: -webkit-linear-gradient(white, #f3f4f7);
      background: -o-linear-gradient(white, #f3f4f7);
      background: -moz-linear-gradient(white, #f3f4f7);
      background: linear-gradient(white, #f3f4f7);
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
          height: calc(100% - 50px);
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
</style>
