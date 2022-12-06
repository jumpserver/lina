<template>
  <div class="box">
    <div class="head">
      <Title :config="titleConfig" />
    </div>
    <ProgressChart v-bind="config" />
  </div>
</template>

<script>
import Title from '../components/Title.vue'
import ProgressChart from '../components/ProgressChart.vue'
export default {
  components: {
    Title,
    ProgressChart
  },
  data() {
    return {
      titleConfig: {
        title: this.$t('dashboard.ProportionOfAssetTypes'),
        tip: this.$t('dashboard.ProportionOfAssetTypes')
      },
      config: {
        data: []
      }
    }
  },
  mounted() {
    this.getChartData()
  },
  methods: {
    async getChartData() {
      const url = '/api/v1/index/?total_count_type_to_assets_amount=1'
      const data = await this.$axios.get(url)
      this.$set(this.config, 'data', data.total_count_type_to_assets_amount)
    }
  }
}
</script>

<style lang="scss" scoped>
  .box {
    margin-top: 16px;
    padding: 20px;
    background: #fff;
    .head {
      display: flex;
      justify-content: space-between;
    }
  }
</style>

