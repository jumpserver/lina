<template>
  <div>
    <Echart
      ref="echarts"
      :options="options"
      :autoresize="true"
      theme="light"
      @finished="genSnapshot"
    />
  </div>
</template>

<script>
import { colorToRgba, getCssVar } from '@/utils/theme/color'
import Echart from '@/components/Dashboard/Echart.vue'

export default {
  name: 'LoginMetric',
  components: { Echart },
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
  data: function () {
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
    options() {
      const primary = getCssVar('--color-primary')
      const secondary = getCssVar('--color-warning')
      const textSecondary = getCssVar('--color-text-secondary')
      const border = getCssVar('--color-border')
      return {
        title: {
          show: false
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: getCssVar('--color-icon-primary')
            }
          },
          appendToBody: true
        },
        legend: {
          top: 0,
          left: 0,
          icon: 'rect',
          // 图例标记的图形宽度
          itemWidth: 10,
          itemHeight: 10,
          itemGap: 12,
          textStyle: {
            color: textSecondary,
            fontSize: 12
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          top: 42,
          bottom: 8,
          containLabel: true
        },
        color: [primary, secondary],
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            axisLine: {
              lineStyle: {
                color: border
              }
            },
            axisLabel: {
              color: textSecondary
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
                color: border
              }
            },
            axisLabel: {
              color: textSecondary
            },
            axisTick: {
              show: false
            },
            // 坐标轴线样式
            splitLine: {
              show: true,
              lineStyle: {
                color: border
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
            symbol: 'circle',
            symbolSize: 5,
            lineStyle: {
              width: 2
            },
            areaStyle: {
              color: colorToRgba(primary, 0.12)
            },
            data: this.primaryData
          },
          {
            name: this.secondaryName,
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 5,
            lineStyle: {
              width: 2
            },
            areaStyle: {
              color: colorToRgba(secondary, 0.12)
            },
            data: this.secondaryData
          }
        ]
      }
    }
  },
  watch: {
    range() {
      this.genSnapshot()
    },
    datesMetrics() {
      this.genSnapshot()
    },
    primaryData() {
      this.genSnapshot()
    },
    secondaryData() {
      this.genSnapshot()
    }
  },
  mounted() {
    this.genSnapshot()
    this._before = () => this.genSnapshot(true)
    this._after = () => this.forceResize()
    window.addEventListener('beforeprint', this._before)
    window.addEventListener('afterprint', this._after)
    // 兼容某些浏览器（Safari）触发 print 媒体切换
    this._mql = window.matchMedia && window.matchMedia('print')
    if (this._mql) {
      const handler = (e) => (e.matches ? this._before() : this._after())
      this._mql.addEventListener?.('change', handler)
      this._mql.addListener?.(handler)
      this._mql._handler = handler
    }
  },
  beforeUnmount() {
    window.removeEventListener('beforeprint', this._before)
    window.removeEventListener('afterprint', this._after)
    if (this._mql) {
      this._mql.removeEventListener?.('change', this._mql._handler)
      this._mql.removeListener?.(this._mql._handler)
    }
  },
  methods: {
    forceResize() {
      const inst = this.$refs.echarts?.echartsInstance
      if (inst) inst.resize()
    },
    async genSnapshot(force = false) {
      if (force) this.forceResize()
      const inst = this.$refs.echarts?.echartsInstance
      if (!inst) return
      try {
        this.dataUrl = inst.getDataURL({ pixelRatio: 2, backgroundColor: '#ffffff' })
      } catch (e) {
        this.dataUrl = ''
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
