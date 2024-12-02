<template>
  <div>
    <el-row :gutter="16">
      <el-col :lg="24" :sm="12" class="margin-top-10">
        <SummaryCountCard :config="logConfig" :items="LogItems" />
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
        title: '当前正在改密情况',
        tip: '当前正在改密情况'
      },
      data: {
        total_count_ongoing_change_secret: 0,
        total_count_ongoing_change_secret_assets: 0,
        total_count_ongoing_change_secret_accounts: 0,
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
          title: '任务执行数',
          body: {
            route: { name: `LoginLogList` },
            count: this.data.total_count_ongoing_change_secret
          }
        },
        {
          title: '资产数',
          body: {
            route: { name: `LoginLogList` },
            count: this.data.total_count_ongoing_change_secret_assets
          }
        },
        {
          title: '账号数',
          body: {
            route: { name: `OperateLogList` },
            count: this.data.total_count_ongoing_change_secret_accounts
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
.margin-top-10 {
  margin-top: 10px;
}
</style>
