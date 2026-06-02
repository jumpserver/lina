<template>
  <div class="box">
    <div class="head">
      <Title :config="config" />
    </div>
    <div class="chart-body">
      <LineChart v-if="loading" v-bind="lineChartConfig" />
    </div>
  </div>
</template>

<script>
import Title from '@/components/Dashboard/Title.vue'
import LineChart from '@/components/Dashboard/LineChart.vue'

export default {
  components: {
    Title,
    LineChart
  },
  props: {
    days: {
      type: [String, Number],
      default: 7
    }
  },
  data() {
    return {
      loading: false,
      config: {
        title: this.$t('UserAssetActivity'),
        tip: this.$t('UserAssetActivity')
      },
      lineChartConfig: {
        datesMetrics: [],
        primaryData: [1],
        primaryName: this.$t('ActiveUsers'),
        secondaryData: [1],
        secondaryName: this.$t('LoginAssets')
      }
    }
  },
  watch: {
    days() {
      this.getMetricData()
    }
  },
  mounted() {
    try {
      this.getMetricData()
    } finally {
      this.loading = true
    }
  },
  methods: {
    async getMetricData() {
      setTimeout(() => {
        const url = `/api/v1/index/?dates_metrics=1&days=${this.days}`
        this.$axios.get(url).then(data => {
          const activeUsers = data?.dates_metrics_total_count_active_users
          const activeAssets = data?.dates_metrics_total_count_active_assets
          this.lineChartConfig.datesMetrics = data.dates_metrics_date
          if (activeUsers.length > 0) {
            this.lineChartConfig.primaryData = activeUsers
          }
          if (activeAssets.length > 0) {
            this.lineChartConfig.secondaryData = activeAssets
          }
        })
      }, 500)
    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 360px;
  padding: var(--space-4, 16px);
  background: var(--surface-panel, #fff);
  border: 1px solid var(--color-border, var(--N200));
  border-radius: var(--radius-card, 8px);

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-3, 12px);
  }
}

.chart-body {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  flex: 1;
  min-height: 0;
  padding-top: var(--space-4, 16px);
}

.chart-body > :deep(div) {
  width: 100%;
}

:deep(.dashboard-echart) {
  height: 304px !important;
  min-height: 304px;
}
</style>
