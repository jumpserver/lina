<template>
  <Page>
    <div class="home">
      <el-container class="container">
        <el-main class="main">
          <div class="content">
            <div class="content-body">
              <el-row>
                <el-col :md="16" :xs="24" style="padding-right: 20px;">
                  <Session />
                  <Assect />
                  <Ticket />
                </el-col>
                <el-col :md="8" :xs="24">
                  <User />
                  <Announcement />
                  <Log />
                </el-col>
              </el-row>
            </div>
          </div>
        </el-main>
      </el-container>
    </div>
  </Page>
</template>

<script>
import { Page } from '@/layout/components'
import store from '@/store'
import User from './components/User'
import Announcement from './components/Announcement'
import Ticket from './components/Ticket'
import Log from './components/Log'
import Assect from './components/Assect'
import Session from './components/Session'

export default {
  name: 'Name',
  components: {
    Page,
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
  .home {
    position: relative;
    height: 100%;
    width: 100%;
    .container {
      position: relative;
      overflow: hidden;
      .main {
        .content {
          position: relative;
          width: 100%;
          height: calc(100% - 50px);
          display: flex;
          flex-direction: column;
          .content-body {
            height: 100%;
            width: 100%;
            margin: 0 auto;
          }
        }
      }
    }
  }
</style>
