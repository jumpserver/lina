<template>
  <echarts :options="options" :autoresize="true" theme="light" />
</template>

<script>
import 'echarts/lib/chart/line'
import 'echarts/lib/component/legend'
export default {
  name: 'LoginMetric',
  props: {
    range: {
      type: String,
      default: 'weekly'
    }
  },
  data: function() {
    return {
      metricsData: {
        dates_metrics_date: [],
        dates_metrics_total_count_active_assets: [],
        dates_metrics_total_count_active_users: [],
        dates_metrics_total_count_login: []
      }
    }
  },
  computed: {
    options() {
      return {
        title: {
          show: false
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          data: [
            this.$t('dashboard.LoginCount'),
            this.$t('dashboard.LoginUsers'),
            this.$t('dashboard.LoginAssets')
          ]
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        color: ['#1ab394', '#1C84C6', '#9CC3DA'],
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: this.metricsData.dates_metrics_date
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        animationDuration: 500,
        series: [
          {
            name: this.$t('dashboard.LoginCount'),
            type: 'line',
            areaStyle: {},
            smooth: true,
            data: this.metricsData.dates_metrics_total_count_login
          },
          {
            name: this.$t('dashboard.LoginUsers'),
            type: 'line',
            areaStyle: {},
            smooth: true,
            data: this.metricsData.dates_metrics_total_count_active_users
          },
          {
            name: this.$t('dashboard.LoginAssets'),
            type: 'line',
            areaStyle: {},
            smooth: true,
            data: this.metricsData.dates_metrics_total_count_active_assets
          }
        ]
      }
    }
  },
  watch: {
    range() {
      this.getMetricData()
    }
  },
  mounted() {
    this.getMetricData()
  },
  methods: {
    async getMetricData() {
      let url = '/api/v1/index/?dates_metrics=1&'
      if (this.range === 'monthly') {
        url = `${url}&monthly=1`
      }
      this.metricsData = await this.$axios.get(url)
    }
  }
}
</script>

<style scoped>
  .echarts {
    width: 100%;
    height: 300px;
  }
</style>
