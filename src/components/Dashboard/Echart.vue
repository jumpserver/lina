<template>
  <echarts
    :options="iOptions"
    v-bind="$attrs"
    @finished="onFinished"
    v-on="$listeners"
  />
</template>

<script>
import 'echarts'

export default {
  components: {},
  props: {
    options: {
      type: Object,
      required: true
    }
  },
  data() {
    const urlParams = new URLSearchParams(window.location.search)
    const isExport = urlParams.get('export') === 'true'
    return {
      isExport: isExport
    }
  },
  computed: {
    iOptions() {
      return {
        ...this.options,
        animation: !this.isExport
      }
    }
  },
  created() {
    if (!window._echarts) {
      window._echarts = {
        total: new Set(),
        finished: new Set()
      }
    }
    // 唯一 id，避免重复计数
    this._chartId = `chart_${Date.now()}_${Math.random().toString(36).slice(2)}`
    window._echarts.total.add(this._chartId)
  },
  beforeDestroy() {
    if (window._echarts) {
      window._echarts.total.delete(this._chartId)
      window._echarts.finished.delete(this._chartId)
      // 可选：当没有图表时清理全局对象
      if (window._echarts.total.size === 0) {
        delete window._echarts
        delete window.echartsFinished
      }
    }
  },
  methods: {
    onFinished() {
      if (!window._echarts) return
      window._echarts.finished.add(this._chartId)
      if (window._echarts.finished.size === window._echarts.total.size) {
        window.echartsFinished = true
      }
    }
  }
}
</script>

<style scoped lang="scss">
</style>
