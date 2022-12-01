<template>
  <div>
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
// eslint-disable-next-line no-unused-vars
import * as echarts from 'echarts'
import { mix } from '@/utils/theme/color'

export default {
  name: 'LoginMetric',
  props: {
    range: {
      type: String,
      default: 'weekly'
    },
    datesMetrics: {
      type: Array,
      default: () => []
    },
    primaryName: {
      type: String,
      default: ''
    },
    primaryData: {
      type: Array,
      default: () => []
    },
    secondaryName: {
      type: String,
      default: ''
    },
    secondaryData: {
      type: Array,
      default: () => []
    }
  },
  data: function() {
    return {
      dataUrl: '',
      metricsData: {
        dates_metrics_date: [],
        dates_metrics_total_count_active_assets: [],
        dates_metrics_total_count_active_users: []
      }
    }
  },
  computed: {
    mixColors() {
      const documentStyle = document.documentElement.style
      const primary = documentStyle.getPropertyValue('--color-primary')
      const colorValue = primary.replace(/#/g, '')
      const TwoLevelColor = mix(colorValue, 'ffffff', 38)
      const ThreeLevelColor = mix(colorValue, 'ffffff', 20)
      const shadowColor = mix(colorValue, 'ffffff', 1)
      return {
        primary,
        TwoLevelColor,
        ThreeLevelColor,
        shadowColor
      }
    },
    options() {
      const { primary, TwoLevelColor, ThreeLevelColor, shadowColor } = this.mixColors
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
          itemHeight: 10
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        color: [primary, '#F3B44B'],
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
            data: this.datesMetrics
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
            name: this.primaryName,
            type: 'line',
            smooth: true,
            areaStyle: {
            // 区域填充样式
              normal: {
                color: new echarts.graphic.LinearGradient(
                  0,
                  0,
                  0,
                  1,
                  [{
                    offset: 0,
                    color: primary
                  }, {
                    offset: 0.6,
                    color: TwoLevelColor
                  },
                  {
                    offset: 0.8,
                    color: ThreeLevelColor
                  }
                  ],
                  false
                ),
                shadowColor: shadowColor,
                shadowBlur: 5
              }
            },
            data: this.primaryData
          },
          {
            name: this.secondaryName,
            type: 'line',
            smooth: true,
            areaStyle: {
            // 区域填充样式
              normal: {
                color: new echarts.graphic.LinearGradient(
                  0,
                  0,
                  0,
                  1,
                  [{
                    offset: 0,
                    color: 'rgba(249, 199, 79, 0.6)'
                  }, {
                    offset: 0.6,
                    color: 'rgba(249, 199, 79, 0.2)'
                  },
                  {
                    offset: 0.8,
                    color: 'rgba(249, 199, 79, 0.1)'
                  }
                  ],
                  false
                ),
                shadowColor: 'rgba(249, 199, 79, 0.1)',
                shadowBlur: 6
              }
            },
            data: this.secondaryData
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
  methods: {
    getDataUrl() {
      this.dataUrl = this.$refs.echarts.getDataURL({})
    }
  }
}
</script>

<style lang="scss" scoped>
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
