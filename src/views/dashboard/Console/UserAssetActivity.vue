<template>
  <div class="box">
    <div class="head">
      <Title :config="config" />
    </div>
    <LineChart v-bind="metricsData" />
  </div>
</template>

<script>
import Title from '../components/Title.vue'
import LineChart from '../components/LineChart.vue'

export default {
  components: {
    Title,
    LineChart
  },
  props: {
  },
  data() {
    return {
      config: {
        title: this.$t('dashboard.UserAssetActivity'),
        tip: this.$t('dashboard.UserAssetActivity')
      },
      metricsData: {
        datesMetrics: [],
        primaryData: [0],
        primaryName: this.$t('dashboard.LoginUsers'),
        secondaryData: [0],
        secondaryName: this.$t('dashboard.LoginAssets')
      }
    }
  },
  mounted() {
    this.getMetricData()
  },
  methods: {
    async getMetricData() {
      const url = '/api/v1/index/?dates_metrics=1&days=7'
      const data = await this.$axios.get(url)
      this.metricsData.datesMetrics = data.dates_metrics_date
      if (this.metricsData.primaryData.length > 1) {
        this.metricsData.primaryData = data.dates_metrics_total_count_active_users
      }
      if (this.metricsData.secondaryData.length > 1) {
        this.metricsData.secondaryData = data.dates_metrics_total_count_active_assets
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

