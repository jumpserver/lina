<template>
  <div>
    <el-row :gutter="16">
      <el-col :lg="24">
        <SummaryChart :config="accountConfig" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import SummaryChart from './SummaryChart.vue'

export default {
  components: {
    SummaryChart
  },
  data() {
    return {
      accountConfig: {
        title: this.$t('AccountData'),
        tip: this.$t('UserData'),
        subTitle: this.$t('AccountTotal'),
        icon: 'users',
        data: [],
        route: { name: 'PamAccounts' },
        total: 0,
        weekAdd: 0,
        connectivityOk: 0,
        secretReset: 0
      }
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    async init() {
      const data = await this.$axios.get(
        '/api/v1/accounts/pam-dashboard/',
        {
          params: {
            total_accounts: 1,
            total_week_add_accounts: 1,
            total_secret_reset_accounts: 1,
            total_connectivity_ok_accounts: 1
          }
        }
      )

      this.accountConfig.total = data.total_accounts
      this.accountConfig.weekAdd = data.total_week_add_accounts
      this.accountConfig.secretReset = data.total_secret_reset_accounts
      this.accountConfig.connectivityOk = data.total_connectivity_ok_accounts
    }
  }
}
</script>
