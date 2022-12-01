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
      default: 7
    }
  },
  data() {
    return {
      logConfig: {
        title: '日志数据',
        tip: '日志数据'
      },
      sessionConfig: {
        title: '会话数据',
        tip: '会话数据'
      },
      data: {
        total_count_login_users: 0,
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
          title: '登录数',
          body: {
            route: { name: `LoginLog` },
            count: this.data.total_count_login_users,
            disabled: !this.$hasPerm('audits.view_userloginlog')
          }
        },
        {
          title: '操作日志数',
          body: {
            route: { name: `OperateLog` },
            count: this.data.total_count_operate_logs,
            disabled: !this.$hasPerm('audits.view_operatelog')
          }
        },
        {
          title: '改密日志数',
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
          title: '在线会话数',
          body: {
            route: { name: `SessionList`, params: { activeMenu: 'OnlineList' }},
            count: this.data.total_count_online_sessions,
            disabled: !this.$hasPerm('terminal.view_session')
          }
        },
        {
          title: '历史会话数',
          body: {
            route: { name: `SessionList`, params: { activeMenu: 'OfflineList' }},
            count: this.data.total_count_history_sessions,
            disabled: !this.$hasPerm('terminal.view_session')
          }
        },
        {
          title: '文件传输数',
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
        &total_count_login_users=1
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
