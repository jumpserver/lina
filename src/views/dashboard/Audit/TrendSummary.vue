<template>
  <div class="box">
    <Title :config="config" style="margin-bottom: 16px;" />
    <ColumnChart v-bind="columnChartConfig" />
  </div>
</template>

<script>
import Title from '../components/Title.vue'
import ColumnChart from '../components/ColumnChart'
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
        title: this.$t('dashboard.SessionConnectTrend'),
        tip: this.$t('dashboard.SessionConnectTrend')
      },
      columnChartConfig: {
        datesMetrics: [],
        primaryData: [0],
        primaryName: this.$t('dashboard.LoginUserToday')
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
      if (loginTotal.length > 1) {
        this.columnChartConfig.primaryData = loginTotal
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  margin-top: 16px;
  padding: 20px;
  background-color: #fff;
}
</style>
