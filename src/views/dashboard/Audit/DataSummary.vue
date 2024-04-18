<template>
  <el-row :gutter="16">
    <el-col :lg="12" :sm="12" class="margin-top-16">
      <DataCard :config="logConfig">
        <div class="custom">
          <span>{{ logConfig.total }}</span>
          <span>
            <svg-icon :icon-class="logConfig.icon" class="font" />
          </span>
        </div>
      </DataCard>
    </el-col>
    <el-col :lg="12" :sm="12" class="margin-top-16">
      <DataCard :config="assetConfig">
        <div class="custom">
          <span>{{ assetConfig.total }}</span>
          <span>
            <svg-icon :icon-class="assetConfig.icon" class="font" />
          </span>
        </div>
      </DataCard>
    </el-col>
  </el-row>
</template>

<script>
import DataCard from '../components/DataCard.vue'
import Decimal from 'decimal.js'
export default {
  components: {
    DataCard
  },
  props: {
    days: {
      type: [Number, String],
      default: '7'
    }
  },
  data() {
    const documentStyle = document.documentElement.style
    const themeColor = documentStyle.getPropertyValue('--color-primary')

    return {
      logConfig: {
        title: this.$t('route.LoginLog'),
        tip: this.$t('route.LoginLog'),
        subTitle: this.$t('route.LoginLog') + this.$t('dashboard.Total'),
        icon: 'log',
        color: themeColor,
        chartTitle: this.$t('dashboard.LogOfLoginSuccessNum'),
        data: []
      },
      assetConfig: {
        title: this.$t('route.Commands'),
        tip: this.$t('route.Commands'),
        subTitle: this.$t('route.Commands') + this.$t('dashboard.Total'),
        icon: 'session',
        color: '#ED612B',
        chartTitle: this.$t('dashboard.DangerousCommandNum'),
        data: []
      }
    }
  },
  watch: {
    days() {
      this.getData()
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    async getData() {
      const data = await this.$axios.get(`/api/v1/index/?days=${this.days}
          &total_count_user_login_logs=1
          &total_count_user_login_success_logs=1
          &total_count_commands=1
          &total_count_commands_danger=1
        `)
      const userLoginSuccessCountDecimal = data.total_count_user_login_success_logs ? new Decimal(data.total_count_user_login_success_logs) : new Decimal(0)
      const userLoginCountDecimal = data.total_count_user_login_logs ? new Decimal(data.total_count_user_login_logs) : new Decimal(0)

      let LoginSucceeded = userLoginSuccessCountDecimal.dividedBy(userLoginCountDecimal).times(100)
      LoginSucceeded = isNaN(LoginSucceeded) ? 0 : LoginSucceeded
      LoginSucceeded = LoginSucceeded.toFixed(2)
      const LoginFailed = LoginSucceeded === 100 ? 0 : 100 - LoginSucceeded
      const logs = [
        { name: this.$t('dashboard.LoginSucceeded'), value: LoginSucceeded.toString() },
        { name: this.$t('dashboard.LoginFailed'), value: LoginFailed.toString() }
      ]
      this.$set(this.logConfig, 'data', logs)
      this.$set(this.logConfig, 'total', data.total_count_user_login_logs)
      this.$set(this.logConfig, 'active', data.total_count_user_login_success_logs)
      this.$set(this.logConfig, 'weekAdd', data.total_count_user_login_success_logs)

      const dangerCommandCountDecimal = data.total_count_commands_danger ? new Decimal(data.total_count_commands_danger) : new Decimal(0)
      const commandCountDecimal = data.total_count_commands ? new Decimal(data.total_count_commands) : new Decimal(0)

      let dangerCommand = dangerCommandCountDecimal.dividedBy(commandCountDecimal).times(100)
      dangerCommand = isNaN(dangerCommand) ? 0 : dangerCommand
      dangerCommand = dangerCommand.toFixed(2)
      const SafeCommand = dangerCommand === 100 ? 0 : 100 - dangerCommand
      const commandCounts = [
        { name: this.$t('dashboard.DangerCommand'), value: dangerCommand.toString() },
        { name: this.$t('dashboard.SafeCommand'), value: SafeCommand.toString() }
      ]
      this.$set(this.assetConfig, 'data', commandCounts)
      this.$set(this.assetConfig, 'total', data.total_count_commands)
      this.$set(this.assetConfig, 'active', data.total_count_commands_danger)
      this.$set(this.assetConfig, 'weekAdd', data.total_count_commands_danger)
    }
  }
}
</script>

<style scoped>
.left, .right {
  display: inline-block;
}
.margin-top-16 {
  margin-top: 16px;
}
</style>
