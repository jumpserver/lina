<template>
  <div>
    <!-- 只有当已有快照时，打印才隐藏图表 -->
    <echarts
      ref="echarts"
      :options="options"
      :autoresize="true"
      theme="light"
      :class="{ 'disabled-when-print': !!dataUrl }"
      @finished="genSnapshot"
    />
    <!-- 打印专用位图 -->
    <img
      v-if="dataUrl"
      :src="dataUrl"
      class="enabled-when-print"
      alt="chart snapshot"
    >
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { mix } from '@/utils/theme/color'

export default {
  name: 'LoginMetric',
  props: {
    range: { type: String, default: 'weekly' },
    datesMetrics: { type: Array, default: () => [] },
    primaryName: { type: String, default: '' },
    primaryData: { type: Array, default: () => [] },
    secondaryName: { type: String, default: '' },
    secondaryData: { type: Array, default: () => [] }
  },
  data() {
    return {
      dataUrl: ''
    }
  },
  computed: {
    mixColors() {
      const s = document.documentElement.style
      const primary = s.getPropertyValue('--color-primary')
      const colorValue = primary.replace(/#/g, '')
      return {
        primary,
        TwoLevelColor: mix(colorValue, 'ffffff', 38),
        ThreeLevelColor: mix(colorValue, 'ffffff', 20),
        shadowColor: mix(colorValue, 'ffffff', 1)
      }
    },
    options() {
      const { primary, TwoLevelColor, ThreeLevelColor, shadowColor } = this.mixColors
      return {
        title: { show: false },
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } } },
        legend: { left: 'auto', icon: 'rect', itemWidth: 10, itemHeight: 10 },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        color: [primary, '#F3B44B'],
        xAxis: [{
          type: 'category', boundaryGap: false,
          axisLine: { lineStyle: { color: '#8F959E' } },
          axisLabel: { textStyle: { color: '#8F959E' } },
          axisTick: { show: false },
          data: this.datesMetrics
        }],
        yAxis: [{
          type: 'value',
          axisLine: { show: false, lineStyle: { color: '#fff' } },
          axisLabel: { textStyle: { color: '#8F959E' } },
          axisTick: { show: false },
          splitLine: { show: true, lineStyle: { color: '#EFF0F1' } }
        }],
        animationDuration: 500,
        series: [
          {
            name: this.primaryName, type: 'line', smooth: true,
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: primary },
                  { offset: 0.6, color: TwoLevelColor },
                  { offset: 0.8, color: ThreeLevelColor }
                ], false),
                shadowColor, shadowBlur: 5
              }
            },
            data: this.primaryData, showSymbol: false, lineStyle: { width: 2 }
          },
          {
            name: this.secondaryName, type: 'line', smooth: true,
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(249,199,79,0.6)' },
                  { offset: 0.6, color: 'rgba(249,199,79,0.2)' },
                  { offset: 0.8, color: 'rgba(249,199,79,0.1)' }
                ], false),
                shadowColor: 'rgba(249,199,79,0.1)', shadowBlur: 6
              }
            },
            data: this.secondaryData, showSymbol: false, lineStyle: { width: 2 }
          }
        ]
      }
    }
  },
  watch: {
    range() { this.genSnapshot() },
    datesMetrics() { this.genSnapshot() },
    primaryData() { this.genSnapshot() },
    secondaryData() { this.genSnapshot() }
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
      const handler = e => (e.matches ? this._before() : this._after())
      this._mql.addEventListener?.('change', handler)
      this._mql.addListener?.(handler)
      this._mql._handler = handler
    }
  },
  beforeDestroy() {
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
        // 提高清晰度 & 设背景，避免打印透明
        this.dataUrl = inst.getDataURL({ pixelRatio: 2, backgroundColor: '#ffffff' })
      } catch (e) {
        // 如果失败，至少别隐藏原图
        this.dataUrl = ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.echarts { width: 100%; height: 272px; }

/* 打印：有快照时隐藏图表，用位图替代 */
@media print {
  .disabled-when-print { display: none !important; }
  .enabled-when-print { display: block !important; width: 100% !important; }
}
</style>
