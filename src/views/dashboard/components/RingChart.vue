<template>
  <div>
    <echarts
      ref="echarts"
      :options="options"
      :autoresize="true"
    />
  </div>
</template>

<script>
import 'echarts/lib/chart/line'
import 'echarts/lib/component/legend'

export default {
  components: {

  },
  props: {

  },
  data() {
    return {
      userConnectData: {
        dates_total_count_active_users: 0,
        dates_total_count_disabled_users: 0,
        dates_total_count_inactive_users: 0
      }
    }
  },
  computed: {
    themeColor() {
      const documentStyle = document.documentElement.style
      return {
        primary: documentStyle.getPropertyValue('--color-primary'),
        info: documentStyle.getPropertyValue('--color-info'),
        success: documentStyle.getPropertyValue('--color-success')
      }
    },
    options() {
      const { primary, info, success } = this.themeColor
      return {
        legend: {
          show: false
        },
        color: [primary, info, success],
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        series: [
          {
            name: this.$t('dashboard.UserRatio'),
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { name: this.$t('dashboard.ActiveUser'), value: this.userConnectData.dates_total_count_active_users },
              { name: this.$t('dashboard.DisabledUser'), value: this.userConnectData.dates_total_count_disabled_users },
              { name: this.$t('dashboard.InActiveUser'), value: this.userConnectData.dates_total_count_inactive_users }
            ]
          }
        ]
      }
    }
  },
  mounted() {
    this.getTotalActiveRadioData()
  },
  methods: {
    async getTotalActiveRadioData() {
      let url = '/api/v1/index/?dates_total_count_users=1&dates_total_count_assets=1'
      if (this.range === 'monthly') {
        url = `${url}&monthly=1`
      }

      const data = await this.$axios.get(url)
      this.userConnectData = data
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
