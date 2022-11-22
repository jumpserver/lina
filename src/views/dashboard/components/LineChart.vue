<template>
  <div class="box">
    <div class="head">
      <span class="title">
        用户/资产活跃情况
        <i class="fa fa-exclamation-circle icon" />
      </span>
      <span class="time">更新时间：2022-11-17</span>
    </div>
    <echarts
      ref="echarts"
      :options="options"
      :autoresize="true"
      heme="light"
      class="disabled-when-print"
      @finished="getDataUrl"
    />
    <img v-if="dataUrl" :src="dataUrl" class="enabled-when-print" style="display: none;width: 100%;">
  </div>
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
      dataUrl: '',
      metricsData: {
        dates_metrics_date: [],
        dates_metrics_total_count_active_assets: [],
        dates_metrics_total_count_active_users: [],
        dates_metrics_total_count_login: []
      }
    }
  },
  computed: {
    themeColor() {
      const documentStyle = document.documentElement.style
      return {
        primary: documentStyle.getPropertyValue('--color-primary'),
        info: documentStyle.getPropertyValue('--color-info'),
        success: documentStyle.getPropertyValue('--color-success')
      }
    },
    options() {
      const { primary, info, success } = this.themeColor
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
          left: 'auto',
          icon: 'rect',
          // 图例标记的图形宽度
          itemWidth: 10,
          itemHeight: 10,
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
        color: [primary, info, success],
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            axisLine: {
              lineStyle: {
                color: '#8F959E'
              }
            },
            axisLabel: {
              textStyle: {
                // 坐标轴颜色
                color: '#8F959E'
              }
            },
            axisTick: {
              show: false
            },
            data: this.metricsData.dates_metrics_date
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '',
            axisLine: {
              show: false,
              lineStyle: {
                color: '#fff'
              }
            },
            axisLabel: {
              textStyle: {
                color: '#8F959E'
              }
            },
            axisTick: {
              show: false
            },
            // 坐标轴线样式
            splitLine: {
              show: true,
              lineStyle: {
                color: '#EFF0F1'
              }
            }
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
    },
    getDataUrl() {
      this.dataUrl = this.$refs.echarts.getDataURL({
      })
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
      .title {
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 26px;
        color: #1F2329;
      }
      .icon {
        color: #BBBFC4;
        cursor: pointer;
      }
      .time {
        font-weight: 400;
        font-size: 10px;
        line-height: 26px;
        text-align: right;
        color: #8F959E;
      }
    }
  }
  .echarts {
    width: 100%;
    height: 266px;
  }
  @media print {
    .disabled-when-print{
      display: none;
    }
    .enabled-when-print{
      display: inherit !important;
    }
    .print-margin{
      margin-top: 10px;
    }
  }
</style>
