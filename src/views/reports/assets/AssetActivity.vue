<template>
  <div>
    <BaseReport
      :title="title"
      :nav="nav"
      :name="name"
      v-bind="$attrs"
    >
      <div class="charts-grid">
        <SwitchDate class="switch-date" @change="onChange" />
        <br>
        <div class="chart-container full-width">
          <div class="chart-container-title">
            <div class="chart-container-title-text">{{ $t('Overview') }}</div>
            <SummaryCountCard
              :items="totalData"
            />
          </div>
        </div>

        <div class="chart-container">
          <div class="chart-container-title">
            <UserAssetActivity :days="days" />
          </div>
        </div>

        <div class="chart-container">
          <div class="chart-container-title">
            <div class="chart-container-title-text">{{ $t('DistributionOfAssetLoginMethods') }}</div>
            <div class="chart">
              <echarts
                :options="LoginEntryOptions"
                :autoresize="true"
              />
            </div>
          </div>
        </div>

        <div class="chart-container">
          <div class="chart-container-title">
            <div class="chart-container-title-text">{{ $t('RemoteLoginProtocolUsageDistribution') }}</div>
            <div class="chart">
              <echarts
                :options="LoginProtocolOptions"
                :autoresize="true"
              />
            </div>
          </div>
        </div>

        <div class="chart-container">
          <div class="chart-container-title">
            <div class="chart-container-title-text">{{ $t('OperatingSystemDistributionOfLoginAssets') }}</div>
            <div class="chart">
              <echarts
                :options="LoginOSOptions"
                :autoresize="true"
              />
            </div>
          </div>
        </div>

        <div class="chart-container full-width">
          <div class="chart-container-title">
            <div class="chart-container-title-text">{{ $t('AssetLoginTrends') }}</div>
            <div class="chart">
              <echarts
                ref="loginTrend"
                :options="loginTrendOptions"
                :autoresize="true"
              />
            </div>
          </div>
        </div>
      </div>
    </BaseReport>
  </div>
</template>

<script>
import SwitchDate from '@/components/Dashboard/SwitchDate'
import BaseReport from '@/views/reports/base/BaseReport.vue'
import SummaryCountCard from '@/components/Dashboard/SummaryCountCard.vue'
import UserAssetActivity from '@/views/reports/console/UserAssetActivity.vue'
import * as echarts from 'echarts'
import { mixColors } from '@/views/reports/const'

export default {
  components: {
    UserAssetActivity,
    SummaryCountCard,
    BaseReport,
    SwitchDate
  },
  props: {
    nav: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      title: this.$t('AssetActivityReport'),
      name: 'AssetReport',
      days: localStorage.getItem('reportDays') || '7',
      session_stats: {
        'total': 0,
        'asset_count': 0,
        'user_count': 0
      },
      pie: {
        'asset_login_by_type': [{ 'name': this.$t('Nothing'), 'value': 0 }],
        'asset_login_by_from': [{ 'name': this.$t('Nothing'), 'value': 0 }],
        'asset_login_by_protocol': [{ 'name': this.$t('Nothing'), 'value': 0 }]
      },
      asset_login_log_metrics: {
        dates_metrics_date: [],
        dates_metrics_total: [0]
      }
    }
  },
  computed: {
    totalData() {
      return [
        {
          title: this.$t('Session'),
          body: {
            count: this.session_stats.total
          }
        },
        {
          title: this.$t('Asset'),
          body: {
            count: this.session_stats.asset_count
          }
        },
        {
          title: this.$t('User'),
          body: {
            count: this.session_stats.user_count
          }
        }
      ]
    },
    LoginEntryOptions() {
      return {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          top: 'bottom'
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            data: this.pie.asset_login_by_from,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 40,
                fontWeight: 'bold'
              }
            }
          }
        ]
      }
    },
    LoginProtocolOptions() {
      return {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 40,
                fontWeight: 'bold'
              }
            },
            data: this.pie.asset_login_by_protocol
          }
        ]
      }
    },
    LoginOSOptions() {
      return {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 40,
                fontWeight: 'bold'
              }
            },
            data: this.pie.asset_login_by_type
          }
        ]
      }
    },
    loginTrendOptions() {
      const { primary } = mixColors()
      return {
        title: {
          show: false
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          left: 'auto',
          icon: 'rect',
          itemWidth: 10,
          itemHeight: 10
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        color: [primary, '#F3B44B'],
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            axisLine: {
              lineStyle: {
                color: '#8F959E'
              }
            },
            axisLabel: {
              textStyle: {
                color: '#8F959E'
              }
            },
            axisTick: {
              show: false
            },
            data: this.asset_login_log_metrics.dates_metrics_date
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '',
            axisLine: {
              show: false,
              lineStyle: {
                color: '#fff'
              }
            },
            axisLabel: {
              textStyle: {
                color: '#8F959E'
              }
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#EFF0F1'
              }
            }
          }
        ],

        animationDuration: 500,
        series: [
          {
            name: this.$t('ConnectionCount'),
            type: 'line',
            smooth: true,
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(
                  0,
                  0,
                  0,
                  1,
                  [{
                    offset: 0,
                    color: 'rgba(249, 199, 79, 0.6)'
                  }, {
                    offset: 0.6,
                    color: 'rgba(249, 199, 79, 0.2)'
                  },
                  {
                    offset: 0.8,
                    color: 'rgba(249, 199, 79, 0.1)'
                  }
                  ],
                  false
                ),
                shadowColor: 'rgba(249, 199, 79, 0.1)',
                shadowBlur: 6
              }
            },
            data: this.asset_login_log_metrics.dates_metrics_total
          }
        ]
      }
    }
  },
  watch: {
    days() {
      this.getData()
    }
  },
  async mounted() {
    await this.getData()
  },
  methods: {
    onChange(val) {
      this.days = val
      localStorage.setItem('reportDays', val)
    },
    conversionData(data) {
      return data.map(item => {
        return {
          name: item.label,
          value: item.total
        }
      })
    },
    setPieData(key, rawData) {
      const converted = this.conversionData(rawData)
      if (converted.length > 0) {
        this.$set(this.pie, key, converted)
      }
    },
    async getData() {
      const data = await this.$axios.get(`/api/v1/reports/reports/asset-activity/?days=${this.days}`)
      this.$set(this.session_stats, 'total', data.session_stats.total)
      this.$set(this.session_stats, 'asset_count', data.session_stats.asset_count)
      this.$set(this.session_stats, 'user_count', data.session_stats.user_count)
      this.$set(this.asset_login_log_metrics, 'dates_metrics_date', data.asset_login_log_metrics.dates_metrics_date)
      this.$set(this.asset_login_log_metrics, 'dates_metrics_total', data.asset_login_log_metrics.dates_metrics_total)

      this.setPieData('asset_login_by_type', data.asset_login_by_type)
      this.setPieData('asset_login_by_from', data.asset_login_by_from)
      this.setPieData('asset_login_by_protocol', data.asset_login_by_protocol)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
