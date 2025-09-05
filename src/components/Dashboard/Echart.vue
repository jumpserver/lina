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
    if (!window.totalCharts) {
      window.totalCharts = 0
    }
    window.totalCharts++
  },
  methods: {
    onFinished() {
      if (!window.finishedCharts) {
        window.finishedCharts = 0
      }
      window.finishedCharts++
      if (window.finishedCharts === window.totalCharts) {
        window.echartsFinished = true
      }
    }
  }
}
</script>

<style scoped lang="scss">
</style>
