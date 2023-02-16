<template>
  <div>
    <el-row :gutter="16">
      <el-col :lg="12" :sm="24" class="margin-top-16">
        <SummaryCountCard :config="logConfig" :items="LogItems" />
      </el-col>
      <el-col :lg="12" :sm="24" class="margin-top-16">
        <SummaryCountCard :config="sessionConfig" :items="sessionItems" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import SummaryCountCard from '../components/SummaryCountCard.vue'

export default {
  components: { SummaryCountCard },
  props: {
    days: {
      type: [Number, String],
      default: '7'
    }
  },
  data() {
    return {
      logConfig: {
        title: this.$t('dashboard.LogData'),
        tip: this.$t('dashboard.LogData')
      },
      sessionConfig: {
        title: this.$t('dashboard.SessionData'),
        tip: this.$t('dashboard.SessionData')
      },
      data: {
        total_count_user_login_logs: 0,
        total_count_operate_logs: 0,
        total_count_change_password_logs: 0,
        total_count_online_sessions: 0,
        total_count_history_sessions: 0,
        total_count_ftp_logs: 0
      }
    }
  },
  computed: {
    LogItems() {
      return [
        {
          title: this.$t('dashboard.LoginNum'),
          body: {
            route: { name: `LoginLogList` },
            count: this.data.total_count_user_login_logs,
            disabled: !this.$hasPerm('audits.view_userloginlog')
          }
        },
        {
          title: this.$t('dashboard.OperationLogNum'),
          body: {
            route: { name: `OperateLogList` },
            count: this.data.total_count_operate_logs,
            disabled: !this.$hasPerm('audits.view_operatelog')
          }
        },
        {
          title: this.$t('dashboard.DeclassificationLogNum'),
          body: {
            route: { name: `PasswordChangeLog` },
            count: this.data.total_count_change_password_logs,
            disabled: !this.$hasPerm('audits.view_passwordchangelog')
          }
        }
      ]
    },
    sessionItems() {
      return [
        {
          title: this.$t('dashboard.OnlineSessions'),
          body: {
            route: { name: `SessionList`, params: { activeMenu: 'OnlineList' }},
            count: this.data.total_count_online_sessions,
            disabled: !this.$hasPerm('terminal.view_session')
          }
        },
        {
          title: this.$t('dashboard.HistoricalSessionNum'),
          body: {
            route: { name: `SessionList`, params: { activeMenu: 'OfflineList' }},
            count: this.data.total_count_history_sessions,
            disabled: !this.$hasPerm('terminal.view_session')
          }
        },
        {
          title: this.$t('dashboard.FileTransferNum'),
          body: {
            route: { name: `FtpLog` },
            count: this.data.total_count_ftp_logs,
            disabled: !this.$hasPerm('audits.view_ftplog')
          }
        }
      ]
    }
  },
  watch: {
    days() {
      this.getData()
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    async getData() {
      this.data = await this.$axios.get(`/api/v1/index/?days=${this.days}
        &total_count_user_login_logs=1
        &total_count_operate_logs=1
        &total_count_change_password_logs=1
        &total_count_online_sessions=1
        &total_count_history_sessions=1
        &total_count_ftp_logs=1
      `)
    }
  }
}
</script>

<style scoped>
.margin-top-16 {
  margin-top: 16px;
}
</style>
