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
      const LoginSucceeded = data.total_count_user_login_success_logs === 0 ? 0 : ((data.total_count_user_login_success_logs / data.total_count_user_login_logs) * 100).toFixed(0)
      const LoginFailed = LoginSucceeded === 100 ? 0 : 100 - LoginSucceeded
      const logs = [
        { name: this.$t('dashboard.LoginSucceeded'), value: LoginSucceeded },
        { name: this.$t('dashboard.LoginFailed'), value: LoginFailed }
      ]
      this.$set(this.logConfig, 'data', logs)
      this.$set(this.logConfig, 'total', data.total_count_user_login_logs)
      this.$set(this.logConfig, 'active', data.total_count_user_login_success_logs)
      this.$set(this.logConfig, 'weekAdd', data.total_count_user_login_success_logs)

      const dangerCommand = data.total_count_commands_danger === 0 ? 0 : ((data.total_count_commands_danger / data.total_count_commands) * 100).toFixed(0)
      const SafeCommand = dangerCommand === 100 ? 0 : 100 - dangerCommand
      const commandCounts = [
        { name: this.$t('dashboard.DangerCommand'), value: dangerCommand },
        { name: this.$t('dashboard.SafeCommand'), value: SafeCommand }
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
