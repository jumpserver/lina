<template>
  <div>
    <div class="box">
      <div class="head">
        <Title :config="config" />
      </div>
      <LineChart v-bind="chartConfig" />
    </div>
    <SummaryCountCard :config="chartTitleConfig" :items="summaryItems" class="margin-top-16" />
  </div>
</template>

<script>
import Title from '../components/Title.vue'
import LineChart from '../components/LineChart.vue'
import SummaryCountCard from '../components/SummaryCountCard.vue'

export default {
  components: {
    Title,
    LineChart,
    SummaryCountCard
  },
  props: {
    days: {
      type: [Number, String],
      default: '7'
    }
  },
  data() {
    return {
      config: {
        title: this.$t('dashboard.SessionTrend'),
        tip: this.$t('dashboard.SessionTrend')
      },
      chartTitleConfig: {
        title: this.$t('route.JobExecutionLog'),
        tip: this.$t('route.JobExecutionLog')
      },
      chartConfig: {
        datesMetrics: [],
        secondaryName: this.$t('dashboard.SessionsNum'),
        secondaryData: [0]
      },
      data: {
        total_count_job_logs_running: 0,
        total_count_job_logs_failed: 0,
        total_count_job_logs: 0
      }
    }
  },
  computed: {
    summaryItems() {
      return [
        {
          title: this.$t('dashboard.TotalJobLog'),
          body: {
            route: { name: `CommandList` },
            count: this.data.total_count_job_logs,
            disabled: true
          }
        },
        {
          title: this.$t('dashboard.TotalJobRunning'),
          body: {
            route: { name: `CommandList` },
            count: this.data.total_count_job_logs_running,
            disabled: true
          }
        },
        {
          title: this.$t('dashboard.TotalJobFailed'),
          body: {
            route: { name: `CommandList` },
            count: this.data.total_count_job_logs_failed,
            disabled: true
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
      const data = await this.$axios.get(`/api/v1/index/?days=${this.days}
        &total_count_job_logs=1
        &total_count_job_logs_running=1
        &total_count_job_logs_failed=1
        &session_dates_metrics=1
      `)
      const totalCountSession = data.dates_metrics_total_count_session
      this.chartConfig.datesMetrics = data.dates_metrics_date
      this.data.total_count_job_logs = data?.total_count_job_logs
      this.data.total_count_job_logs_running = data?.total_count_job_logs_running
      this.data.total_count_job_logs_failed = data?.total_count_job_logs_failed
      if (totalCountSession.length > 1) {
        this.chartConfig.secondaryData = totalCountSession
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.margin-top-16 {
  margin-top: 16px;
}

.box {
  margin-top: 16px;
  padding: 20px;
  background: #fff;

  .head {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }
}
</style>
