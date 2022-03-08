<template>
  <Page>
    <div v-if="$hasPerm('rbac.view_resourcestatistics')" class="home">
      <el-container class="container">
        <el-main class="main">
          <div class="content">
            <div class="content-body">
              <el-row>
                <el-col :md="16" :xs="24" style="padding-right: 20px;">
                  <Session />
                  <Log />
                  <Ticket v-if="hasValidLicense" />
                </el-col>
                <el-col :md="8" :xs="24">
                  <User />
                  <Announcement />
                </el-col>
              </el-row>
            </div>
          </div>
        </el-main>
      </el-container>
    </div>
    <Page403 v-else />
  </Page>
</template>

<script>
import { Page } from '@/layout/components'
import User from './components/User'
import Announcement from './components/Announcement'
import Ticket from './components/Ticket'
import Log from './components/LoginLog'
import Session from './components/Session'
import Page403 from '@/views/403'

export default {
  name: 'Name',
  components: {
    Page,
    User,
    Announcement,
    Ticket,
    Log,
    Session,
    Page403
  },
  data() {
    return {
    }
  },
  computed: {
    hasValidLicense() {
      return this.$store.getters.hasValidLicense
    }
  },
  methods: {
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
