<template>
  <div class="box">
    <div class="header">
      <Title :config="config" />
    </div>

    <div class="content">
      <!-- eslint-disable-next-line -->
      <div ref="chartRef" class="chart-container"></div>
    </div>
  </div>
</template>

<script>
import Title from '../components/Title.vue'
import * as echarts from 'echarts'
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'

export default {
  name: 'MissionSummery',
  components: { Title },
  data() {
    return {
      config: {
        title: '任务执行情况',
        tip: '任务执行情况'
      },
      counter: {
        total_count_gathered_account_automation: 0,
        total_count_push_account_automation: 0,
        total_count_backup_account_automation: 0,
        total_count_risk_account: 0,
        total_count_integration_application: 0
      },
      chart: null
    }
  },
  computed: {
    chartOption() {
      return {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderColor: '#eee',
          borderWidth: 1,
          padding: [10, 15],
          textStyle: {
            color: '#666'
          }
        },
        legend: {
          type: 'scroll',
          orient: 'horizontal',
          top: 0,
          left: 0,
          right: 0,
          itemGap: 20,
          textStyle: {
            color: '#666',
            fontSize: 12
          },
          icon: 'circle',
          itemWidth: 8,
          itemHeight: 8
        },
        series: [
          {
            name: '任务分布',
            type: 'pie',
            radius: ['45%', '65%'],
            center: ['50%', '55%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 8
            },
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}\n{c}',
              color: '#666',
              fontSize: 12,
              lineHeight: 18
            },
            labelLine: {
              show: true,
              length: 15,
              length2: 10,
              smooth: true
            },
            data: [
              {
                value: this.counter.total_count_gathered_account_automation,
                name: '账号收集任务'
              },
              {
                value: this.counter.total_count_push_account_automation,
                name: '账号推送任务'
              },
              {
                value: this.counter.total_count_backup_account_automation,
                name: '账号备份任务'
              },
              {
                value: this.counter.total_count_risk_account,
                name: '风险账号'
              },
              {
                value: this.counter.total_count_integration_application,
                name: '集成应用'
              }
            ],
            emphasis: {
              scaleSize: 5,
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.2)'
              }
            }
          }
        ],
        color: ['#2B937C', '#5470c6', '#91cc75', '#fac858', '#ee6666']
      }
    }
  },
  watch: {
    counter: {
      handler() {
        this.updateChart()
      },
      deep: true
    }
  },
  async mounted() {
    this.initChart()
    this.counter = await this.getResourcesCount()
    this.updateChart()
    window.addEventListener('resize', this.resizeChart)
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
    window.removeEventListener('resize', this.resizeChart)
  },
  methods: {
    async getResourcesCount() {
      return this.$axios.get('/api/v1/accounts/pam-dashboard/',
        {
          params: {
            total_count_gathered_account_automation: 1,
            total_count_push_account_automation: 1,
            total_count_backup_account_automation: 1,
            total_count_risk_account: 1,
            total_count_integration_application: 1
          }
        }
      )
    },
    initChart() {
      this.chart = echarts.init(this.$refs.chartRef)
      this.chart.setOption(this.chartOption)
    },
    updateChart() {
      if (this.chart) {
        this.chart.setOption(this.chartOption)
      }
    },
    resizeChart() {
      if (this.chart) {
        this.chart.resize()
      }
    }
  }
}
</script>

<style scoped lang="scss">
.box {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .header {
    padding: 16px 20px 0;
  }

  .content {
    flex: 1;
    min-height: 0;
    padding: 0 10px 20px;
    display: flex;
    align-items: center;
    justify-content: center;

    .chart-container {
      width: 100%;
      height: 420px;
    }
  }
}

:deep(.echarts) {
  .el-legend {
    .el-legend-item {
      &:hover {
        color: var(--color-primary);
      }
    }
  }
}
</style>
