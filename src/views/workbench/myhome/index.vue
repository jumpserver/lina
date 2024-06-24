<template>
  <Page>
    <Announcement />
    <div class="home">
      <el-container class="container">
        <el-main class="main">
          <div class="content">
            <div class="content-body">
              <el-row>
                <el-col :md="16" :xs="24" class="content-left">
                  <Session />
                  <Ticket
                    v-if="$hasLicense() && $hasPerm('tickets.view_ticket')"
                    :url="url"
                  />
                </el-col>
                <el-col :md="8" :xs="24">
                  <User />
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
import { Announcement } from '@/components'
import User from './components/User'
import Ticket from './components/Ticket'
import Log from './components/LoginLog'
import Session from './components/Session'
import { mapGetters } from 'vuex'

export default {
  name: 'Name',
  components: {
    Announcement,
    Page,
    User,
    Ticket,
    Log,
    Session
  },
  computed: {
    url() {
      return `/api/v1/tickets/tickets/?assignees__id=${this.currentUser.id}&state=pending`
    },
    ...mapGetters([
      'currentUser'
    ])
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
        padding: 0;
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
  .content-left {
    padding-right: 20px;
  }
  @media screen and (max-width: 992px) {
    .content-left {
      padding-right: 0;
    }
  }
</style>
