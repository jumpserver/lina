<template>
  <div>
    <BaseReport
      title="用户活跃度分析报告"
      :nav="nav"
      :name="name"
      :description="description"
      v-bind="$attrs"
    >
      <div class="charts-grid">
        <SwitchDate class="switch-date" @change="onChange" />
        <!-- 全宽图表 -->
        <div class="chart-container full-width">
          <div class="chart-container-title">
            <div class="chart-container-title-text">用户登录趋势</div>
            <div class="chart">
              <echarts
                ref="loginTrend"
                :options="loginTrendOptions"
                :autoresize="true"
              />
            </div>
          </div>
        </div>

        <!-- 用户登录趋势 -->
        <div class="chart-container">
          <div class="chart-container-title">
            <div class="chart-container-title-text">用户登录失败趋势</div>
            <div class="chart">
              <echarts
                ref="loginFailed"
                :options="loginFailedOptions"
                :autoresize="true"
              />
            </div>
          </div>
        </div>

        <!-- 密码重置统计 -->
        <div class="chart-container">
          <div class="chart-container-title">
            <div class="chart-container-title-text">登录方法统计</div>
            <div class="chart">
              <echarts
                ref="passwordReset"
                :options="loginMethodOptions"
                :autoresize="true"
              />
            </div>
          </div>
        </div>

        <!-- 用户活跃度分布 -->
        <div class="chart-container">
          <div class="chart-container-title">
            <div class="chart-container-title-text">登录城市分布</div>
            <div class="chart">
              <echarts
                ref="userActivity"
                :options="userActivityOptions"
                :autoresize="true"
              />
            </div>
          </div>
        </div>

        <!-- 访问时段分布 -->
        <div class="chart-container">
          <div class="chart-container-title">
            <div class="chart-container-title-text">访问时段分布</div>
            <div class="chart">
              <echarts
                ref="timeDistribution"
                :options="timeDistributionOptions"
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
// eslint-disable-next-line no-unused-vars
import BaseReport from '@/views/reports/base/BaseReport.vue'
import SwitchDate from '@/components/Dashboard/SwitchDate'

export default {
  components: {
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
      name: 'UserActivity',
      // 生成随机数据的辅助函数
      description: 'This report shows the activities of users in terms of password usage - how many times logged in, password access, reset tasks and other details.',
      days: localStorage.getItem('reportDays') || '7',
      config: {
        user_login_failed_metrics: {
          dates_metrics_date: [],
          dates_metrics_total: [0]
        },
        user_login_log_metrics: {
          dates_metrics_date: [],
          dates_metrics_total: [0]
        },
        user_login_method_metrics: {
          dates_metrics_date: [],
          dates_metrics_total: {}
        },
        user_login_region_distribution: [],
        user_login_time_metrics: {}
      }
    }
  },
  computed: {
    loginFailedOptions() {
      return {
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: this.config.user_login_failed_metrics.dates_metrics_date,
          axisLabel: { rotate: 45 }
        },
        yAxis: {
          type: 'value',
          name: '失败次数'
        },
        series: [
          {
            name: '失败次数',
            data: this.config.user_login_failed_metrics.dates_metrics_total,
            type: 'bar',
            itemStyle: { color: '#c23531' },
            areaStyle: { opacity: 0.2 }
          }
        ]
      }
    },
    // 用户登录趋势（折线图）
    loginTrendOptions() {
      return {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: this.config.user_login_log_metrics.dates_metrics_date,
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          name: '登录次数'
        },
        series: [
          {
            name: '登录次数',
            data: this.config.user_login_log_metrics.dates_metrics_total,
            type: 'bar',
            barWidth: '40%',
            itemStyle: {
              color: '#91cc75',
              borderRadius: [4, 4, 0, 0]
            }
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
        series: Object.keys(this.config.user_login_method_metrics.dates_metrics_total).map(name => ({
          name,
          stack: 'name',
          type: 'bar',
          data: this.config.user_login_method_metrics.dates_metrics_total[name]
        }))
      }
    },

    // 用户活跃度分布（饼图）
    userActivityOptions() {
      return {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          show: false
        },
        series: [
          {
            name: '登录城市分布',
            type: 'pie',
            radius: ['40%', '70%'],
            data: this.config.user_login_region_distribution
          }
        ]
      }
    },
    timeDistributionOptions() {
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
      this.$set(this.config.user_login_log_metrics, 'dates_metrics_date', data.user_login_log_metrics.dates_metrics_date)
      this.$set(this.config.user_login_log_metrics, 'dates_metrics_total', data.user_login_log_metrics.dates_metrics_total)
      this.$set(this.config, 'user_login_region_distribution', data.user_login_region_distribution)
      this.$set(this.config.user_login_method_metrics, 'dates_metrics_date', data.user_login_method_metrics.dates_metrics_date)
      this.$set(this.config.user_login_method_metrics, 'dates_metrics_total', data.user_login_method_metrics.dates_metrics_total)
      this.$set(this.config, 'user_login_time_metrics', data.user_login_time_metrics)
      this.$set(this.config.user_login_failed_metrics, 'dates_metrics_date', data.user_login_failed_metrics.dates_metrics_date)
      this.$set(this.config.user_login_failed_metrics, 'dates_metrics_total', data.user_login_failed_metrics.dates_metrics_total)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
