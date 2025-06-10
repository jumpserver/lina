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
        用户活跃图
      </div>
      <div>
        <div class="description">
          This report shows the activities of users in terms of password usage - how many times logged in, password access, reset tasks and other details.
        </div>
        <div class="chart-container">
          <div class="chart-container-title">
            <div class="chart-container-title-text">
              User Activity
            </div>
          </div>
        </div>
      </div>
      <div class="chart">
        <echarts
          ref="echarts"
          :options="options"
          :autoresize="true"
        />
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
  props: {
  },
  data() {
    return {}
  },
  computed: {
    options() {
      return {
        xAxis: {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: [820, 932, 901, 934, 1290, 1330, 1320],
            type: 'line',
            smooth: true
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
  height: 272px;
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

.content {
  background-color: #F1F1F1;
}
</style>
