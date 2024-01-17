<template>
  <div>
    <el-row :gutter="16">
      <el-col :lg="12" :sm="24">
        <RankTable :config="userConfig" />
      </el-col>
      <el-col :lg="12" :sm="24">
        <RankTable :config="assetConfig" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import RankTable from '../components/RankTable.vue'

export default {
  components: {
    RankTable
  },
  data() {
    return {
      userConfig: {
        title: this.$t('dashboard.LoginUserRanking'),
        url: '/api/v1/index/?dates_login_times_top10_users=1',
        tip: this.$t('dashboard.LoginUserRanking'),
        data: 'dates_login_times_top10_users',
        columns: [
          {
            prop: 'user',
            label: this.$t('users.Username')
          },
          {
            prop: 'total',
            label: this.$t('dashboard.LoginCount'),
            width: '120px'
          }
        ]
      },
      assetConfig: {
        title: this.$t('dashboard.ActiveAssetRanking'),
        url: '/api/v1/index/?dates_login_times_top10_assets=1',
        tip: this.$t('dashboard.ActiveAssetRanking'),
        data: 'dates_login_times_top10_assets',
        columns: [
          {
            prop: 'asset',
            label: this.$t('dashboard.AssetName')
          },
          {
            prop: 'total',
            label: this.$t('dashboard.NumberOfVisits'),
            width: '140px'
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
