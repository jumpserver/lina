<template>
  <div class="box" :class="{ embedded }">
    <div v-if="!embedded" class="head">
      <Title :config="config" />
    </div>
    <LineChart v-if="loading" v-bind="lineChartConfig" />
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
    },
    metrics: {
      type: Object,
      default: () => ({})
    },
    embedded: {
      type: Boolean,
      default: false
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
    metrics: {
      handler() {
        if (this.metrics?.dates_metrics_date?.length) {
          this.applyMetrics(this.metrics)
        }
      },
      deep: true
    },
    days() {
      if (this.metrics?.dates_metrics_date?.length) {
        return
      }
      this.getMetricData()
    }
  },
  mounted() {
    try {
      if (this.metrics?.dates_metrics_date?.length) {
        this.applyMetrics(this.metrics)
      } else {
        this.getMetricData()
      }
    } finally {
      this.loading = true
    }
  },
  methods: {
    applyMetrics(data) {
      const activeUsers = data?.dates_metrics_total_count_active_users || []
      const activeAssets = data?.dates_metrics_total_count_active_assets || []
      this.lineChartConfig.datesMetrics = data?.dates_metrics_date || []
      if (activeUsers.length > 0) {
        this.lineChartConfig.primaryData = activeUsers
      }
      if (activeAssets.length > 0) {
        this.lineChartConfig.secondaryData = activeAssets
      }
    },
    async getMetricData() {
      setTimeout(() => {
        const url = `/api/v1/index/?dates_metrics=1&days=${this.days}`
        this.$axios.get(url).then((data) => {
          this.applyMetrics(data)
        })
      }, 500)
    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  margin-top: 16px;
  padding: 20px;
  background: #fff;

  &.embedded {
    margin-top: 0;
    padding: 0;

    :deep(.echarts) {
      height: 260px;
    }
  }

  .head {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }
}
</style>
