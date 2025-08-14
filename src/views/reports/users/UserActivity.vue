<template>
  <div>
    <BaseReport
      :title="title"
      :nav="nav"
      :name="name"
      v-bind="$attrs"
    >
      <div class="charts-grid">

        <div class="chart-container full-width">
          <div class="chart-container-title">
            <div class="chart-container-title-text">{{ $t('Overview') }}</div>
            <SummaryCountCard
              :items="totalData"
            />
          </div>
        </div>

        <SwitchDate class="switch-date" @change="onChange" />
        <div class="chart-container full-width">
          <div class="chart-container-title">
            <div class="chart-container-title-text">{{ $t('UserLoginTrends') }}</div>
            <div class="chart">
              <echarts
                ref="loginTrend"
                :options="loginTrendOptions"
                :autoresize="true"
              />
            </div>
          </div>
        </div>

        <div class="chart-container">
          <div class="chart-container-title">
            <div class="chart-container-title-text">{{ $t('LoginSource') }}</div>
            <div class="chart">
              <echarts
                :options="LoginSourceOptions"
                :autoresize="true"
              />
            </div>
          </div>
        </div>

        <div class="chart-container">
          <div class="chart-container-title">
            <div class="chart-container-title-text">{{ $t('VisitTimeDistribution') }}</div>
            <div class="chart">
              <echarts
                :options="VisitTimeOptions"
                :autoresize="true"
              />
            </div>
          </div>
        </div>

        <div class="chart-container full-width">
          <div class="chart-container-title">
            <div class="chart-container-title-text">{{ $t('LoginMethodStatistics') }}</div>
            <div class="chart">
              <echarts
                :options="loginMethodOptions"
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
import BaseReport from '@/views/reports/base/BaseReport.vue'
import SwitchDate from '@/components/Dashboard/SwitchDate'
import * as echarts from 'echarts'
import { mixColors } from '@/views/reports/const'
import SummaryCountCard from '@/components/Dashboard/SummaryCountCard.vue'

export default {
  components: {
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
      title: this.$t('UserLoginReport'),
      name: 'UserReport',
      days: localStorage.getItem('reportDays') || '7',
      user_stats: {
        total: 0,
        not_enabled_mfa: 0,
        valid: 0,
        first_login: 0,
        face_vector: 0,
        need_update_password: 0
      },
      pie: {
        'user_by_source': [{ 'name': this.$t('Nothing'), 'value': 0 }]
      },
      config: {
        user_login_failed_metrics: {
          dates_metrics_date: [],
          dates_metrics_total: [0]
        },
        user_login_log_metrics: {
          dates_metrics_date: [],
          dates_metrics_success_total: [0],
          dates_metrics_failure_total: [0]
        },
        user_login_method_metrics: {
          dates_metrics_date: [],
          dates_metrics_total: {}
        },
        user_login_time_metrics: {}
      }
    }
  },
  computed: {
    totalData() {
      return [
        {
          title: this.$t('Total'),
          body: {
            count: this.user_stats.total
          }
        },
        {
          title: this.$t('NotEnableMfa'),
          body: {
            count: this.user_stats.not_enabled_mfa
          }
        },
        {
          title: this.$t('FirstLogin'),
          body: {
            count: this.user_stats.first_login
          }
        },
        {
          title: this.$t('Valid'),
          body: {
            count: this.user_stats.valid
          }
        },
        {
          title: this.$t('FaceVector'),
          body: {
            count: this.user_stats.face_vector
          }
        },
        {
          title: this.$t('NeedUpdatePassword'),
          body: {
            count: this.user_stats.need_update_password
          }
        }
      ]
    },
    LoginSourceOptions() {
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
            minAngle: 5,
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
                fontSize: 20,
                fontWeight: 'bold'
              }
            },
            data: this.pie.user_by_source
          }
        ]
      }
    },
    loginTrendOptions() {
      const { primary, TwoLevelColor, ThreeLevelColor, shadowColor } = mixColors()
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
            data: this.config.user_login_log_metrics.dates_metrics_date
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
            // 坐标轴线样式
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
            name: this.$t('Success'),
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
                    color: primary
                  }, {
                    offset: 0.6,
                    color: TwoLevelColor
                  }, {
                    offset: 0.8,
                    color: ThreeLevelColor
                  }],
                  false
                ),
                shadowColor: shadowColor,
                shadowBlur: 5
              }
            },
            data: this.config.user_login_log_metrics.dates_metrics_success_total
          },
          {
            name: this.$t('Failed'),
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
                  }, {
                    offset: 0.8,
                    color: 'rgba(249, 199, 79, 0.1)'
                  }],
                  false
                ),
                shadowColor: 'rgba(249, 199, 79, 0.1)',
                shadowBlur: 6
              }
            },
            data: this.config.user_login_log_metrics.dates_metrics_failure_total
          }
        ]
      }
    },
    loginMethodOptions() {
      return {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: this.config.user_login_method_metrics.dates_metrics_date,
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          name: ''
        },
        barCategoryGap: '70%',
        series: Object.keys(this.config.user_login_method_metrics.dates_metrics_total).map(name => ({
          name,
          stack: 'name',
          type: 'bar',
          data: this.config.user_login_method_metrics.dates_metrics_total[name]
        }))
      }
    },
    VisitTimeOptions() {
      const max = Math.max(...Object.values(this.config.user_login_time_metrics))
      return {
        tooltip: {
          trigger: 'item'
        },
        radar: {
          indicator: [
            { name: '00:00-06:00', max: max },
            { name: '06:00-12:00', max: max },
            { name: '12:00-18:00', max: max },
            { name: '18:00-24:00', max: max }
          ]
        },
        series: [
          {
            name: '访问分布',
            type: 'radar',
            data: [
              {
                value: Object.values(this.config.user_login_time_metrics),
                name: '访问量',
                areaStyle: {
                  opacity: 0.3
                }
              }
            ]
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
    async getData() {
      const data = await this.$axios.get(`/api/v1/reports/reports/users/?days=${this.days}`)
      this.$set(this.user_stats, 'total', data.user_stats.total)
      this.$set(this.user_stats, 'not_enabled_mfa', data.user_stats.not_enabled_mfa)
      this.$set(this.user_stats, 'valid', data.user_stats.valid)
      this.$set(this.user_stats, 'first_login', data.user_stats.first_login)
      this.$set(this.user_stats, 'face_vector', data.user_stats.face_vector)
      this.$set(this.user_stats, 'need_update_password', data.user_stats.need_update_password)
      this.$set(this.config.user_login_log_metrics, 'dates_metrics_date', data.user_login_log_metrics.dates_metrics_date)
      this.$set(this.config.user_login_log_metrics, 'dates_metrics_success_total', data.user_login_log_metrics.dates_metrics_success_total)
      this.$set(this.config.user_login_log_metrics, 'dates_metrics_failure_total', data.user_login_log_metrics.dates_metrics_failure_total)
      this.$set(this.config.user_login_method_metrics, 'dates_metrics_date', data.user_login_method_metrics.dates_metrics_date)
      this.$set(this.config.user_login_method_metrics, 'dates_metrics_total', data.user_login_method_metrics.dates_metrics_total)
      this.$set(this.config, 'user_login_time_metrics', data.user_login_time_metrics)

      const userBySource = data.user_by_source
      if (userBySource.length !== 0) {
        this.$set(this.pie, 'user_by_source', userBySource)
      } else {
        this.$set(this.pie, 'user_by_source', [{ 'name': this.$t('Nothing'), 'value': 0 }])
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
