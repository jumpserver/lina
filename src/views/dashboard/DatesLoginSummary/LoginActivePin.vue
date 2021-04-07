<template>
  <div class="statistic-box">
    <h4>{{ $t('dashboard.ActiveUserAssetsRatioTitle') }}</h4>
    <el-row :gutter="2">
      <el-col :md="12" :sm="10">
        <echarts :options="userOption" :autoresize="true" />
        <div style="" class="print-display">
          <div class="circle-icon" style="background: #1ab394;" />
          <label>{{ $t('dashboard.ActiveUser') }}</label>
          <div class="circle-icon" style="background: #1C84C6;" />
          <label>{{ $t('dashboard.DisabledUser') }}</label>
          <div class="circle-icon" style="background: #9CC3DA;" />
          <label>{{ $t('dashboard.InActiveUser') }}</label>
        </div>
      </el-col>
      <el-col :md="12" :sm="10">
        <echarts :options="AssetOption" :autoresize="true" />
        <div style="" class="print-display">
          <div class="circle-icon" style="background: #1ab394;" />
          <label>{{ $t('dashboard.ActiveAsset') }}</label>
          <div class="circle-icon" style="background: #1C84C6;" />
          <label>{{ $t('dashboard.DisabledAsset') }}</label>
          <div class="circle-icon" style="background: #9CC3DA;" />
          <label>{{ $t('dashboard.InActiveAsset') }}</label>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'

export default {
  name: 'LoginActivePin',
  props: {
    range: {
      type: String,
      default: 'weekly'
    }
  },
  data() {
    return {
      userConnectData: {
        dates_total_count_active_users: 0,
        dates_total_count_disabled_users: 0,
        dates_total_count_inactive_users: 0
      },
      assetConnectData: {
        dates_total_count_active_assets: 0,
        dates_total_count_disabled_assets: 0,
        dates_total_count_inactive_assets: 0
      }
    }
  },
  computed: {
    userOption() {
      return {
        legend: {
          show: false
        },
        title: {
          subtext: this.$t('dashboard.User')
        },
        color: ['#1ab394', '#1C84C6', '#9CC3DA'],
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
    },
    AssetOption() {
      return {
        legend: {
          show: false
        },
        title: {
          subtext: this.$t('dashboard.Asset')
        },
        color: ['#1ab394', '#1C84C6', '#9CC3DA'],
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        series: [
          {
            name: this.$t('dashboard.AssetRatio'),
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
              { name: this.$t('dashboard.ActiveAsset'), value: this.assetConnectData.dates_total_count_active_assets },
              { name: this.$t('dashboard.DisabledAsset'), value: this.assetConnectData.dates_total_count_disabled_assets },
              { name: this.$t('dashboard.InActiveAsset'), value: this.assetConnectData.dates_total_count_inactive_assets }
            ]
          }
        ]
      }
    }
  },
  watch: {
    range() {
      this.getTotalActiveRadioData()
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
      this.assetConnectData = data
    }
  }
}
</script>

<style scoped>
  .echarts {
    width: 100%;
    height: 250px;
  }
  .print-display {
    display: none;
  }
  .circle-icon {
    width: 14px;
    height: 14px;
    -moz-border-radius: 7px;
    -webkit-border-radius: 7px;
    border-radius: 7px;
    display:inline-block;
  }
  @media print {
    .el-col-24{
      width: 50% !important;
    }
    .print-display {
      display: inherit;
    }
  }
</style>
