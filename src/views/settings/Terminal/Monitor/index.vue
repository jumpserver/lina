<template>
  <el-row v-if="loaded" :gutter="40">
    <el-col v-for="metric of metricsData" :key="metric.type" :lg="12" :md="24">
      <MonitorCard :type="metric.type" :component-metric="metric" class="monitorCard" />
    </el-col>
  </el-row>
</template>

<script>
import MonitorCard from './component/MonitorCard'

export default {
  name: 'SystemMonitor',
  components: {
    MonitorCard
  },
  data() {
    return {
      metricsData: [],
      loaded: false
    }
  },
  computed: {
  },
  mounted() {
    this.getMetricsData()
  },
  methods: {
    async getMetricsData() {
      const url = '/api/v1/terminal/components/metrics/'
      this.$axios.get(url).then((data) => {
        this.metricsData = data
      }).finally(() => {
        this.loaded = true
      })
    }
  }
}
</script>

<style lang='less' scoped>
.monitorCard{
  //margin-bottom: 20px;
  padding: 20px 30px;
}
@media (min-width: 768px){
  .illo-desktop-header {
    position: relative;
    display: block !important;
    margin-bottom: -6%;
  }
}
img{
  vertical-align: middle;
  max-width: 100%;
  height: auto;
  border: 0;
}

</style>
