<template>
  <div class="box">
    <div class="head">
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
      const url = `/api/v1/index/?dates_metrics=1&days=${this.days}`
      const data = await this.$axios.get(url)
      const activeUsers = data?.dates_metrics_total_count_active_users
      const activeAssets = data?.dates_metrics_total_count_active_assets
      this.lineChartConfig.datesMetrics = data.dates_metrics_date
      if (activeUsers.length > 0) {
        this.lineChartConfig.primaryData = activeUsers
      }
      if (activeAssets.length > 0) {
        this.lineChartConfig.secondaryData = activeAssets
      }
    }
  }
}
</script>

<style lang="scss" scoped>
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

