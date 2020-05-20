<template>
  <IBox :title="title">
    <TopList :items="assetsItems" :unit="unit" class="top-assets" />
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
      unit: this.$t('dashboard.timesWeekUnit'),
      dates_login_times_top10_assets: [{
        'asset': 'jump_10.1.240.70',
        'total': 44,
        'last': '2020-05-19 08:43:51.180220+00:00'
      }]
    }
  },
  computed: {
    assetsItems() {
      return this.dates_login_times_top10_assets.map((v) => {
        return { name: v.asset, count: v.total }
      })
    }
  }
}
</script>

<style scoped>
  .top-assets >>> .list-group {
    margin-top: 0;
  }
</style>
