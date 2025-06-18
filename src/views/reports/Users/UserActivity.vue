<template>
  <div>
    <BaseReport
      title="用户活跃度分析报告"
      :nav="nav"
      :description="description"
    >
      <div class="charts-grid">
        <SwitchDate class="switch-date" />
        <!-- 全宽图表 -->
        <div class="chart-container full-width">
          <div class="chart-container-title">
            <div class="chart-container-title-text">用户总活跃趋势（全宽）</div>
            <div class="chart">
              <echarts
                ref="totalActivity"
                :options="totalActivityOptions"
                :autoresize="true"
              />
            </div>
          </div>
        </div>

        <!-- 用户登录趋势 -->
        <div class="chart-container">
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

        <!-- 密码重置统计 -->
        <div class="chart-container">
          <div class="chart-container-title">
            <div class="chart-container-title-text">密码重置统计</div>
            <div class="chart">
              <echarts
                ref="passwordReset"
                :options="passwordResetOptions"
                :autoresize="true"
              />
            </div>
          </div>
        </div>

        <!-- 用户活跃度分布 -->
        <div class="chart-container">
          <div class="chart-container-title">
            <div class="chart-container-title-text">用户活跃度分布</div>
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
      // 生成随机数据的辅助函数
      generateRandomData: (min, max, count) => {
        return Array.from({ length: count }, () =>
          Math.floor(Math.random() * (max - min + 1)) + min
        )
      },
      description: 'This report shows the activities of users in terms of password usage - how many times logged in, password access, reset tasks and other details.'
    }
  },
  computed: {
    // 新增全宽图表配置
    totalActivityOptions() {
      const dates = Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (29 - i))
        return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
      })
      return {
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: dates,
          axisLabel: { rotate: 45 }
        },
        yAxis: {
          type: 'value',
          name: '总活跃度'
        },
        series: [
          {
            name: '总活跃度',
            data: this.generateRandomData(500, 2000, 30),
            type: 'bar',
            itemStyle: { color: '#1da1f2' },
            areaStyle: { opacity: 0.2 }
          }
        ]
      }
    },
    // 用户登录趋势（折线图）
    loginTrendOptions() {
      const dates = Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (29 - i))
        return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
      })

      return {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: dates,
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
            data: this.generateRandomData(100, 500, 30),
            type: 'line',
            smooth: true,
            areaStyle: {
              opacity: 0.3
            }
          }
        ]
      }
    },

    // 密码重置统计（柱状图）
    passwordResetOptions() {
      return {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: {
          type: 'value',
          name: '重置次数'
        },
        series: [
          {
            name: '重置次数',
            data: this.generateRandomData(5, 30, 7),
            type: 'bar',
            barWidth: '40%',
            itemStyle: {
              borderRadius: [4, 4, 0, 0]
            }
          }
        ]
      }
    },

    // 用户活跃度分布（饼图）
    userActivityOptions() {
      return {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center'
        },
        series: [
          {
            name: '活跃度分布',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
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
                fontSize: '20',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: this.generateRandomData(100, 500, 1)[0], name: '高活跃' },
              { value: this.generateRandomData(100, 500, 1)[0], name: '中活跃' },
              { value: this.generateRandomData(100, 500, 1)[0], name: '低活跃' },
              { value: this.generateRandomData(100, 500, 1)[0], name: '不活跃' }
            ]
          }
        ]
      }
    },

    // 访问时段分布（雷达图）
    timeDistributionOptions() {
      return {
        tooltip: {
          trigger: 'item'
        },
        radar: {
          indicator: [
            { name: '00:00-06:00', max: 100 },
            { name: '06:00-12:00', max: 100 },
            { name: '12:00-18:00', max: 100 },
            { name: '18:00-24:00', max: 100 }
          ]
        },
        series: [
          {
            name: '访问分布',
            type: 'radar',
            data: [
              {
                value: this.generateRandomData(20, 100, 4),
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
  mounted() {
    console.log('>>> ', this.nav)
  }
}
</script>

<style lang="scss" scoped>

</style>
