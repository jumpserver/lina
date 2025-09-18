<template>
  <div class="chart-container full-width">
    <Title :config="config" style="margin: 10px 0;" />
    <ColumnChart v-bind="columnChartConfig" />
  </div>
</template>

<script>
import Title from '@/components/Dashboard/Title.vue'
import ColumnChart from '@/components/Dashboard/ColumnChart'

export default {
  components: { Title, ColumnChart },
  props: {
    days: {
      type: [Number, String],
      default: '7'
    }
  },
  data() {
    return {
      config: {
        title: this.$t('SessionConnectTrend'),
        tip: this.$t('SessionConnectTrend')
      },
      columnChartConfig: {
        datesMetrics: [],
        primaryData: [0],
        primaryName: this.$t('LoginUserToday')
      }
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
      const data = await this.$axios.get(`/api/v1/index/?dates_metrics=1&days=${this.days}`)
      const loginTotal = data?.dates_metrics_total_count_login
      this.columnChartConfig.datesMetrics = data.dates_metrics_date
      if (loginTotal.length > 0) {
        this.columnChartConfig.primaryData = loginTotal
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.chart-container {
  padding-bottom: 20px;
}
</style>
