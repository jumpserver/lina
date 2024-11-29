<template>
  <div>
    <el-row :gutter="16">
      <el-col :lg="12" :sm="24" class="margin-top-10">
        <SummaryCountCard :config="logConfig" :items="LogItems" />
      </el-col>
      <el-col :lg="12" :sm="24" class="margin-top-10">
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
        title: '当前状态',
        tip: '当前状态'
      },
      sessionConfig: {
        title: '改密任务执行状态',
        tip: '改密任务执行状态'
      },
      data: {
        total_count_change_secrets: 0,
        total_count_periodic_change_secrets: 0,
        total_count_change_secret_assets: 0,
        total_count_change_secret_executions: 0,
        total_count_success_change_secret_executions: 0,
        total_count_failed_change_secret_executions: 0
      }
    }
  },
  computed: {
    LogItems() {
      return [
        {
          title: '任务数',
          body: {
            route: { name: `LoginLogList` },
            count: this.data.total_count_change_secrets
          }
        },
        {
          title: '定时任务数',
          body: {
            route: { name: `LoginLogList` },
            count: this.data.total_count_periodic_change_secrets
          }
        },
        {
          title: '资产数',
          body: {
            route: { name: `OperateLogList` },
            count: this.data.total_count_change_secret_assets
          }
        }
      ]
    },
    sessionItems() {
      return [
        {
          title: '任务执行数',
          body: {
            route: { name: `SessionList`, params: { activeMenu: 'OnlineList' }},
            count: this.data.total_count_change_secret_executions
          }
        },
        {
          title: '成功数',
          body: {
            route: { name: `SessionList`, params: { activeMenu: 'OfflineList' }},
            count: this.data.total_count_success_change_secret_executions
          }
        },
        {
          title: '失败数',
          body: {
            route: { name: `FtpLog` },
            count: this.data.total_count_failed_change_secret_executions
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
      this.data = await this.$axios.get(`/api/v1/accounts/change-secret-dashboard/?days=${this.days}
        &total_count_change_secrets=1
        &total_count_periodic_change_secrets=1
        &total_count_change_secret_assets=1
        &total_count_change_secret_status=1
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
