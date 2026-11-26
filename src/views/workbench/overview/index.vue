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
                  <Ticket v-if="$hasLicense() && $hasPerm('tickets.view_ticket')" :url="url" />
                </el-col>
                <el-col :md="8" :xs="24">
                  <User
                    :summary="summary"
                    :loading="loading"
                    :error="failure === 'failed'"
                    :denied="failure === 'denied'"
                    @refresh="loadSummary"
                  />
                  <SecurityOverview
                    :summary="summary"
                    :all-orgs="allOrgs"
                    :loading="loading"
                    :error="failure === 'failed'"
                    :denied="failure === 'denied'"
                    @refresh="loadSummary"
                  />
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
import SecurityOverview from './components/SecurityOverview.vue'
import { mapGetters } from 'vuex'
import { GLOBAL_ORG_ID } from '@/utils/jms/org'
import { getRequestOrgId } from '@/utils/requestOrg'

export default {
  name: 'Name',
  components: {
    Announcement,
    Page,
    User,
    Ticket,
    Log,
    Session,
    SecurityOverview
  },
  data() {
    return {
      summary: null,
      loading: false,
      failure: null,
      requestId: 0,
      expiryTimer: null
    }
  },
  computed: {
    orgId() {
      return getRequestOrgId(this.$route, this.$store.getters.currentOrg?.id)
    },
    allOrgs() {
      return this.orgId === GLOBAL_ORG_ID || String(this.orgId).toLowerCase() === 'root'
    },
    url() {
      return `/api/v1/tickets/tickets/?assignees__id=${this.currentUser.id}&state=pending`
    },
    ...mapGetters(['currentUser'])
  },
  watch: {
    orgId: {
      immediate: true,
      handler() {
        this.summary = null
        this.loadSummary()
      }
    }
  },
  mounted() {
    window.addEventListener('focus', this.onFocus)
  },
  beforeUnmount() {
    this.requestId++
    window.removeEventListener('focus', this.onFocus)
    window.clearTimeout(this.expiryTimer)
  },
  methods: {
    onFocus() {
      if (!this.loading) this.loadSummary()
    },
    async loadSummary() {
      const id = ++this.requestId
      window.clearTimeout(this.expiryTimer)
      this.loading = true
      this.failure = null
      try {
        const data = await this.$axios.get('/api/v1/authentication/security-overview/', {
          disableFlashErrorMsg: true
        })
        if (id !== this.requestId) return
        this.summary = data
        if (data?.temp_tokens?.enabled && data.temp_tokens.next_expiry) {
          const delay = Date.parse(data.temp_tokens.next_expiry) - Date.parse(data.generated_at)
          if (delay > 0) {
            this.expiryTimer = window.setTimeout(
              this.loadSummary,
              Math.min(delay + 1000, 2147483647)
            )
          }
        }
      } catch (error) {
        if (id !== this.requestId) return
        this.summary = null
        this.failure = error.response?.status === 403 ? 'denied' : 'failed'
      } finally {
        if (id === this.requestId) this.loading = false
      }
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
