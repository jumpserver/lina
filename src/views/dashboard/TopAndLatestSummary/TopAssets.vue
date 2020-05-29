<template>
  <IBox :title="title">
    <TopList v-if="assetsItems.length > 0" :items="assetsItems" :unit="unit" class="top-assets" />
    <span v-else>{{ $t('common.NoData') }}</span>
  </IBox>
</template>

<script>
import IBox from '@/components/IBox'
import TopList from '@/components/TopList'
export default {
  name: 'TopAssets',
  components: { TopList, IBox },
  data() {
    return {
      title: this.$t('dashboard.TopAssetsOfWeek'),
      unit: this.$t('dashboard.TimesWeekUnit'),
      dates_login_times_top10_assets: []
    }
  },
  computed: {
    assetsItems() {
      return this.dates_login_times_top10_assets.map((v) => {
        return { name: v.asset, count: v.total }
      })
    }
  },
  mounted() {
    this.getTopLoginAssets()
  },
  methods: {
    async getTopLoginAssets() {
      const data = await this.$axios.get('/api/v1/index/?dates_login_times_top10_assets=1')
      this.dates_login_times_top10_assets = data.dates_login_times_top10_assets
    }
  }
}
</script>

<style scoped>
  .top-assets >>> .list-group {
    margin-top: 0;
  }
</style>
