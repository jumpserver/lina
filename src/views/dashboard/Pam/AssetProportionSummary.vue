<template>
  <div class="box">
    <div class="head">
      <Title :config="titleConfig" />
    </div>
    <ProgressChart v-if="config.data.length > 0" v-bind="config" />
    <div v-else class="no-data">{{ $tc('NoData') }}</div>
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
  props: {
    url: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      titleConfig: {
        title: '',
        tip: this.$t('ProportionOfAssetTypes')
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
      if (!this.url) return

      try {
        const data = await this.$axios.get(this.url)
        const str = data[this.url.split('?')[1].split('=')[0]]

        if (this.url.includes('accounts')) {
          this.titleConfig.title = this.$t('ProportionOfAccontTypes')
          this.titleConfig.tip = this.$t('ProportionOfAccountTypes')
        } else {
          this.titleConfig.title = this.$t('ProportionOfAssetTypes')
          this.titleConfig.tip = this.$t('ProportionOfAssetTypes')
        }

        this.$set(this.config, 'data', str)
      } catch (e) {
        this.$message.error(e.message)
      }
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
  .no-data {
    text-align: center;
    font-size: 14px;
    margin-top: 6px;
  }
</style>

