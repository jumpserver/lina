<template>
  <IBox :title="title">
    <TopList v-if="userItems.length > 0" :items="userItems" :unit="unit" class="top-users" />
    <span v-else>{{ $t('common.NoData') }}</span>
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
      unit: this.$t('dashboard.TimesWeekUnit'),
      dates_login_times_top10_users: []
    }
  },
  computed: {
    userItems() {
      return this.dates_login_times_top10_users.map((v) => {
        return { name: v.user, count: v.total }
      })
    }
  },
  mounted() {
    this.getTopLoginUser()
  },
  methods: {
    async getTopLoginUser() {
      const data = await this.$axios.get('/api/v1/index/?dates_login_times_top10_users=1')
      this.dates_login_times_top10_users = data.dates_login_times_top10_users
    }
  }
}
</script>

<style scoped>
  .top-users >>> .list-group {
    margin-top: 0;
  }
</style>
