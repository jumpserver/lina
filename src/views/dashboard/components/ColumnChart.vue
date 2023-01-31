<template>
  <div class="content">
    <echarts
      ref="echarts"
      :options="options"
      :autoresize="true"
    />
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import * as echarts from 'echarts'
import { mix } from '@/utils/theme/color'

export default {
  components: {},
  props: {
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
    }
  },
  data() {
    return {}
  },
  computed: {
    mixColors() {
      const documentStyle = document.documentElement.style
      const primary = documentStyle.getPropertyValue('--color-primary')
      const colorValue = primary.replace(/#/g, '')
      const TwoLevelColor = mix(colorValue, 'ffffff', 48)
      const ThreeLevelColor = mix(colorValue, 'ffffff', 6)
      return {
        primary,
        TwoLevelColor,
        ThreeLevelColor
      }
    },
    options() {
      const { primary, TwoLevelColor, ThreeLevelColor } = this.mixColors
      return {
        grid: {
          left: '2%',
          top: '3%',
          right: '2%',
          bottom: '1%',
          containLabel: true
        },
        tooltip: {
          show: true
        },
        xAxis: [{
          type: 'category',
          name: '',
          nameLocation: 'center',
          nameGap: 35,
          nameTextStyle: {
            color: '#8796AD',
            fontSize: '16'
          },
          axisLabel: {
            textStyle: {
              color: '#8796AD',
              fontSize: '14'
            }
          },
          data: this.datesMetrics,
          axisLine: {
            lineStyle: {
              width: 2,
              color: '#BBBFC4'
            }
          },
          axisTick: {
            show: false
          }
        }],
        yAxis: [{
          type: 'value',
          name: '',
          nameLocation: 'middle',
          nameGap: 45,
          nameTextStyle: {
            color: '#8796AD',
            fontSize: '16'
          },
          axisLabel: {
            textStyle: {
              color: '#8796AD',
              fontSize: '14'
            }
          },
          axisTick: {
            show: false
          },
          axisLine: {
            show: false
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(160,160,160,0.3)'
            }
          }
        }],
        series: [{
          type: 'bar',
          name: this.primaryName,
          stack: 1,
          barWidth: '20%',
          borderWidth: 0,
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: TwoLevelColor
              },
              {
                offset: 1,
                color: ThreeLevelColor
              }
              ], false)
            }
          },
          label: {
            normal: {
              show: false
            }
          },
          data: this.primaryData
        },
        {
          type: 'pictorialBar',
          name: this.primaryName,
          symbol: 'rect',
          symbolSize: ['25%', 6],
          symbolOffset: [0, -6],
          z: 12,
          itemStyle: {
            normal: {
              color: primary
            }
          },
          label: {
            show: false,
            position: 'top',
            fontSize: 16
          },
          symbolPosition: 'end',
          data: this.primaryData
        }
        ]
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.echarts {
  width: 100%;
  height: 272px;
}
</style>
