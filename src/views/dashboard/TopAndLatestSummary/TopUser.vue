<template>
  <IBox :title="title">
    <TopList :items="assetsItems" :unit="unit" class="top-assets" />
  </IBox>
</template>

<script>
import IBox from '@/components/IBox'
import TopList from '@/components/TopList'
export default {
  name: 'TopUser',
  components: { TopList, IBox },
  data() {
    return {
      title: this.$t('dashboard.TopUsersOfWeek'),
      unit: this.$t('dashboard.timesWeekUnit'),
      dates_login_times_top10_users: [{
        'user': 'Administrator (admin)',
        'total': 37,
        'last': '2020-05-19 08:43:51.180220+00:00'
      }, {
        'user': 'li (lisi)',
        'total': 5,
        'last': '2020-05-19 08:43:51.180220+00:00'
      }, { 'user': 'zhang (zhangsan)', 'total': 2, 'last': '2020-05-18 08:43:51.180220+00:00' }]
    }
  },
  computed: {
    assetsItems() {
      return this.dates_login_times_top10_users.map((v) => {
        return { name: v.user, count: v.total }
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
