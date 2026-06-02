<template>
  <div class="chart-container transport-box">
    <div class="box">
      <div class="head">
        <Title :config="config" />
      </div>
      <LineChart v-bind="chartConfig" />
    </div>
    <SummaryCountCard :config="chartTitleConfig" :items="summaryItems" class="margin-top-10" />
  </div>
</template>

<script>
import Title from '@/components/Dashboard/Title.vue'
import LineChart from '@/components/Dashboard/LineChart.vue'
import SummaryCountCard from '@/components/Dashboard/SummaryCountCard.vue'

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
        title: this.$t('SessionTrend'),
        tip: this.$t('SessionTrend')
      },
      chartTitleConfig: {
        title: this.$t('JobExecutionLog'),
        tip: this.$t('JobExecutionLog')
      },
      chartConfig: {
        datesMetrics: [],
        secondaryName: this.$t('SessionsNum'),
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
          title: this.$t('TotalJobLog'),
          body: {
            route: { name: `CommandList` },
            count: this.data.total_count_job_logs,
            disabled: true
          }
        },
        {
          title: this.$t('TotalJobRunning'),
          body: {
            route: { name: `CommandList` },
            count: this.data.total_count_job_logs_running,
            disabled: true
          }
        },
        {
          title: this.$t('TotalJobFailed'),
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
      if (totalCountSession.length > 0) {
        this.chartConfig.secondaryData = totalCountSession
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.chart-container  {
  padding: 0 !important;
}

.box {
  background: var(--surface-panel, #fff);
  padding: var(--space-4, 16px);
  border: 1px solid var(--color-border, var(--N200));
  border-radius: var(--radius-card, 8px);

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-3, 12px);
  }

}
</style>
