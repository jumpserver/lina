<template>
  <div :class="{ box: !disableBox }">
    <div v-if="isTitle" class="head">
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
      type: [Number, String],
      default: '7'
    },
    isTitle: {
      type: Boolean,
      default: true
    },
    disableBox: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      config: {
        title: this.$t('AccountResult'),
        tip: this.$t('AccountResult')
      },
      lineChartConfig: {
        datesMetrics: [],
        primaryData: [1],
        primaryName: this.$t('Success'),
        secondaryData: [1],
        secondaryName: this.$t('Failed')
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
        const url = `/api/v1/accounts/change-secret-dashboard/?daily_success_and_failure_metrics=1&days=${this.days}`
        this.$axios.get(url).then(data => {
          const success = data?.dates_metrics_total_count_success
          const failed = data?.dates_metrics_total_count_failed
          this.lineChartConfig.datesMetrics = data?.dates_metrics_date
          if (success.length > 0) {
            this.lineChartConfig.primaryData = success
          }
          if (failed.length > 0) {
            this.lineChartConfig.secondaryData = failed
          }
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

  .head {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }
}
</style>
