<template>
  <echarts
    :options="iOptions"
    v-bind="$attrs"
    @rendered="onRendered"
    v-on="$listeners"
  />
</template>

<script>
import 'echarts'

export default {
  components: {
  },
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
    onRendered() {
      if (!window.renderCharts) {
        window.renderCharts = 0
      }
      window.renderCharts++
      if (window.renderCharts === window.totalCharts) {
        window.echartsRendered = true
      }
    }
  }
}
</script>

<style scoped lang="scss">
</style>
