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
        month_metrics_date: [],
        month_metrics_total_count_active_assets: [],
        month_metrics_total_count_active_users: [],
        month_metrics_total_count_login: []
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
            data: this.metricsData.month_metrics_date
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
            data: this.metricsData.month_metrics_total_count_login
          },
          {
            name: this.$t('dashboard.LoginUsers'),
            type: 'line',
            areaStyle: {},
            smooth: true,
            data: this.metricsData.month_metrics_total_count_active_users
          },
          {
            name: this.$t('dashboard.LoginAssets'),
            type: 'line',
            areaStyle: {},
            smooth: true,
            data: this.metricsData.month_metrics_total_count_active_assets
          }
        ]
      }
    }
  },
  async mounted() {
    this.metricsData = await this.getMetricData()
  },
  methods: {
    getMetricData() {
      return this.$axios.get('/api/v1/index/?month_metrics=1')
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
