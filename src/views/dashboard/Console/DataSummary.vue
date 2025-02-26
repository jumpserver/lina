<template>
  <div>
    <el-row :gutter="16">
      <el-col :lg="12" :sm="12">
        <DataCard :config="userConfig" />
      </el-col>
      <el-col :lg="12" :sm="12">
        <DataCard :config="assetConfig" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import DataCard from '@/components/Dashboard/DataCard.vue'
import Decimal from 'decimal.js'
export default {
  components: {
    DataCard
  },
  data() {
    const documentStyle = document.documentElement.style
    const themeColor = documentStyle.getPropertyValue('--color-primary')

    return {
      userConfig: {
        title: this.$t('UserData'),
        tip: this.$t('UserData'),
        subTitle: this.$t('UsersTotal'),
        icon: 'users',
        subIcon: 'broken-line',
        color: '#FFD260',
        chartTitle: this.$t('LoginUserToday'),
        data: [],
        route: { name: 'UserList' }
      },
      assetConfig: {
        title: this.$t('AssetData'),
        tip: this.$t('AssetData'),
        subTitle: this.$t('AssetsTotal'),
        icon: 'assets',
        subIcon: 'broken-line',
        color: themeColor,
        chartTitle: this.$t('LoginAssetToday'),
        data: [],
        route: { name: 'AssetList' }
      }
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    async init() {
      const data = await this.$axios.get(`/api/v1/index/?total_count_users=1
          &total_count_users_this_week=1
          &total_count_login_users=1
          &total_count_assets=1
          &total_count_assets_this_week=1
          &total_count_today_active_assets=1
        `)

      const loginUserCountDecimal = data.total_count_login_users ? new Decimal(data.total_count_login_users) : new Decimal(0)
      const userCountDecimal = data.total_count_users ? new Decimal(data.total_count_users) : new Decimal(0)

      let userActive = loginUserCountDecimal.dividedBy(userCountDecimal).times(100)
      userActive = isNaN(userActive) ? 0 : userActive
      userActive = userActive.toFixed(2)
      const userTotal = userActive === 100 ? 0 : 100 - userActive
      const users = [
        { name: this.$t('ActiveUser'), value: userActive.toString() },
        { name: this.$t('InActiveUser'), value: userTotal.toString() }
      ]
      this.$set(this.userConfig, 'data', users)
      this.$set(this.userConfig, 'total', data.total_count_users)
      this.$set(this.userConfig, 'active', data.total_count_login_users)
      this.$set(this.userConfig, 'weekAdd', data.total_count_users_this_week)

      const ActiveAssetCountDecimal = data.total_count_today_active_assets ? new Decimal(data.total_count_today_active_assets) : new Decimal(0)
      const AssetCountDecimal = data.total_count_assets ? new Decimal(data.total_count_assets) : new Decimal(0)

      let assetActive = ActiveAssetCountDecimal.dividedBy(AssetCountDecimal).times(100)
      assetActive = isNaN(assetActive) ? 0 : assetActive
      assetActive = assetActive.toFixed(2)
      const assetTotal = assetActive === 100 ? 0 : 100 - assetActive
      const assets = [
        { name: this.$t('ActiveAsset'), value: assetActive.toString() },
        { name: this.$t('InActiveAsset'), value: assetTotal.toString() }
      ]
      this.$set(this.assetConfig, 'data', assets)
      this.$set(this.assetConfig, 'total', data.total_count_assets)
      this.$set(this.assetConfig, 'active', data.total_count_today_active_assets)
      this.$set(this.assetConfig, 'weekAdd', data.total_count_assets_this_week)
    }
  }
}
</script>

<style scoped>
.left, .right {
  display: inline-block;
}
</style>
