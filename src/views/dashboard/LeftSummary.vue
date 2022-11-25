<template>
  <div>
    <RealTimeSummary />
    <LineChart />
  </div>
</template>

<script>
import RealTimeSummary from './components/RealTimeSummary.vue'
import LineChart from './components/LineChart.vue'
export default {
  components: {
    RealTimeSummary,
    LineChart
  },
  props: {

  },
  data() {
    return {

    }
  },
  created() {

  },
  methods: {

  }
}
</script>

<style scoped>

</style>
