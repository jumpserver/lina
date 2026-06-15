<template>
  <div ref="wrap" :class="rootClass" :style="rootStyle">
    <echarts
      v-if="ready"
      v-bind="chartAttrs"
      :option="iOptions"
      autoresize
      @finished="onFinished"
    />
  </div>
</template>

<script>
import 'echarts'

export default {
  components: {},
  inheritAttrs: false,
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
      isExport: isExport,
      // 仅当容器真正有了宽高后再创建图表,彻底规避
      // echarts 0 尺寸初始化导致的 "Can't get DOM width or height"
      ready: false
    }
  },
  computed: {
    chartAttrs() {
      const attrs = { ...this.$attrs }
      delete attrs.class
      delete attrs.style
      return attrs
    },
    rootClass() {
      return ['echarts', 'echart-wrap', this.$attrs.class]
    },
    rootStyle() {
      return this.$attrs.style
    },
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
  mounted() {
    if (this.tryReady()) {
      return
    }
    // 容器初始尺寸为 0(异步组件 / 隐藏 / 尚未布局),
    // 用 ResizeObserver 等到它有了尺寸再渲染图表
    if (typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver(() => {
        this.tryReady()
      })
      this._ro.observe(this.$refs.wrap)
    } else {
      // 兜底:下一帧再尝试
      this._rafId = window.requestAnimationFrame(() => {
        this.ready = true
      })
    }
  },
  beforeUnmount() {
    if (this._ro) {
      this._ro.disconnect()
      this._ro = null
    }
    if (this._rafId) {
      window.cancelAnimationFrame(this._rafId)
    }
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
    tryReady() {
      if (this.ready) {
        return true
      }
      const el = this.$refs.wrap
      if (el && el.clientWidth > 0 && el.clientHeight > 0) {
        this.ready = true
        if (this._ro) {
          this._ro.disconnect()
          this._ro = null
        }
        return true
      }
      return false
    },
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

<!-- 非 scoped:为 vue-echarts 渲染的自定义元素 <x-vue-echarts> 兜底尺寸规则,
     确保即使 vue-echarts/style.css 未生效,容器也能撑开,避免 0 尺寸 -->
<style>
x-vue-echarts {
  display: block;
  width: 100%;
  height: 100%;
  min-width: 0;
}
</style>

<style scoped lang="scss">
.echart-wrap {
  width: 100%;
  min-width: 0;
}
</style>
