<template>
  <div class="home">
    <NavHeader />
    <el-container class="container">
      <el-main class="main">
        <div class="content">
          <div class="content-body">
            <el-row class="public-height">
              <el-col :span="16" class="public public-height" style="padding-right: 20px;">
                <div class="">
                  aaa
                </div>
                <div class="">
                  aaa
                </div>
                <div class="">
                  aaa
                </div>
                <div class="">
                  aaa
                </div>
                <div class="">
                  aaa
                </div>
                <div class="">
                  aaa
                </div>
              </el-col>
              <el-col :span="8" class="public public-height">
                <Huser />
                <div class="">
                  aaaweq
                </div>
                <div class="">
                  aaaeqweq
                </div>
                <div class="">
                  aaaqwew
                </div>
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
import Huser from './components/Huser'

export default {
  name: 'Name',
  components: {
    NavHeader,
    Huser
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
          height: 180px;
          background-image: url("https://cloudcache.tencentcs.com/qcloud/tea/app/overview.6bcfd5ac8b153a95aaf95ecca9b23e53.png");
          background-size: auto 100%;
          background-repeat: no-repeat;
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
          // border: 1px blue solid;
          .content-body {
            height: 100%;
            width: 100%;
            // border: 1px solid pink;
            max-width: 1360px;
            margin: 0 auto;
          }
        }
      }
    }
  }
  .public > div {
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 2px 4px 0 rgb(54 58 80 / 32%);
    width: 100%;
    &:nth-child(n) {
      margin-bottom: 20px;
    }
  }
  .public-height {
    height: 100%;
    // border: 1px solid red;
  }
  .public-wigth {
    width: 100%;
  }
  .public-box {
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 2px 4px 0 rgb(54 58 80 / 32%);
    width: 100%;
    // border: 1px solid blue;
  }

</style>
