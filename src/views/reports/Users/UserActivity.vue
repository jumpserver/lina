<template>
  <div>
    <div class="header nav-bar">
      <div class="nav-bar-logo">
        <Logo />
      </div>
      <div class="nav-bar-right">
        <el-button type="primary" size="small">Export</el-button>
        <el-button type="primary" size="small">Print</el-button>
      </div>
    </div>
    <div class="content">
      <div class="title">
        用户活跃度分析报告
      </div>
      <div class="description">
        This report shows the activities of users in terms of password usage - how many times logged in, password access, reset tasks and other details.
      </div>

      <div class="charts-grid">
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
    </div>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import * as echarts from 'echarts'
import Logo from '@/layout/components/NavLeft/Logo'

export default {
  components: {
    Logo
  },
  data() {
    return {
      // 生成随机数据的辅助函数
      generateRandomData: (min, max, count) => {
        return Array.from({ length: count }, () =>
          Math.floor(Math.random() * (max - min + 1)) + min
        )
      }
    }
  },
  computed: {
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
  }
}
</script>

<style lang="scss" scoped>
.echarts {
  width: 100%;
  height: 300px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--banner-bg);
  padding: 16px;
  height: 48px;
}

.title {
  height: 35px;
  background-color: white;
  line-height: 35px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  padding: 0 16px;
}

.description {
  font-size: 14px;
  color: #333;
  padding: 16px;
  background-color: white;
}

.content {
  background-color: #F1F1F1;
  min-height: calc(100vh - 48px);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 16px;
  max-width: 1600px;
  margin: 0 auto;
}

.chart-container {
  background-color: white;
  border-radius: 4px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.chart-container-title {
  margin-bottom: 16px;
}

.chart-container-title-text {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

/* 大屏幕 (1600px 以上) */
@media screen and (min-width: 1600px) {
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    padding: 24px;
  }

  .echarts {
    height: 400px;
  }

  .chart-container {
    padding: 24px;
  }

  .chart-container-title-text {
    font-size: 18px;
  }
}

/* 中等屏幕 (1200px - 1599px) */
@media screen and (max-width: 1599px) {
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 16px;
  }

  .echarts {
    height: 300px;
  }
}

/* 平板 (768px - 1199px) */
@media screen and (max-width: 1199px) {
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 12px;
  }

  .echarts {
    height: 250px;
  }

  .chart-container {
    padding: 12px;
  }

  .chart-container-title-text {
    font-size: 15px;
  }
}

/* 手机 (768px 以下) */
@media screen and (max-width: 767px) {
  .charts-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 12px;
  }

  .echarts {
    height: 250px;
  }

  .chart-container {
    padding: 12px;
  }

  .chart-container-title-text {
    font-size: 14px;
  }

  .description {
    font-size: 13px;
    padding: 12px;
  }

  .header {
    padding: 12px;
  }

  .nav-bar-right {
    .el-button {
      padding: 8px 12px;
      font-size: 12px;
    }
  }
}

/* 小屏手机 (480px 以下) */
@media screen and (max-width: 480px) {
  .charts-grid {
    gap: 8px;
    padding: 8px;
  }

  .echarts {
    height: 200px;
  }

  .chart-container {
    padding: 8px;
  }

  .chart-container-title {
    margin-bottom: 8px;
  }

  .chart-container-title-text {
    font-size: 13px;
    margin-bottom: 4px;
  }

  .description {
    font-size: 12px;
    padding: 8px;
  }

  .header {
    padding: 8px;
    height: 40px;
  }

  .nav-bar-right {
    .el-button {
      padding: 6px 10px;
      font-size: 11px;
    }
  }
}
</style>
