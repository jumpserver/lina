<template>
  <RankTable :config="userConfig" />
</template>

<script>
import RankTable from './RankTable.vue'

export default {
  components: {
    RankTable
  },
  data() {
    return {
      userConfig: {
        url: '/api/v1/index/?dates_login_times_top10_users=1',
        tip: this.$t('LoginUserRanking'),
        data: 'dates_login_times_top10_users',
        columns: [
          {
            prop: 'user',
            label: this.$t('Username')
          },
          {
            prop: 'total',
            label: this.$t('LoginCount')
          }
        ]
      }
    }
  }
}
</script>
