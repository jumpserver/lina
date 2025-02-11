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
        title: this.$t('Task Distribution'),
        tip: this.$t('Task Distribution')
      },
      counter: {
        total_count_change_secret_automation: 0,
        total_count_push_account_automation: 0,
        total_count_gathered_account_automation: 0,
        total_count_backup_account_automation: 0,
        total_count_integration_application: 0
      },
      chart: null
    }
  },
  computed: {
    chartOption() {
      return {
        legend: {
          orient: 'vertical',
          top: '13%',
          right: '15%',
          itemGap: 20,
          textStyle: {
            color: '#666',
            fontSize: 12
          },
          icon: 'circle',
          itemWidth: 8,
          itemHeight: 8,
          formatter: (name) => {
            const data = [
              { name: this.$t('BaseAccountChangeSecret'), value: this.counter.total_count_change_secret_automation },
              { name: this.$t('BaseAccountPush'), value: this.counter.total_count_push_account_automation },
              { name: this.$t('DiscoverAccounts'), value: this.counter.total_count_gathered_account_automation },
              { name: this.$t('AccountBackup'), value: this.counter.total_count_backup_account_automation },
              { name: this.$t('RelevantApp'), value: this.counter.total_count_integration_application }
            ]
            const item = data.find(item => item.name === name)

            return name.padEnd(10, '\u2003') + (item.value || 0)
          }
        },
        series: [
          {
            name: this.$t('Task Distribution'),
            type: 'pie',
            radius: ['50%', '70'],
            center: ['25%', '50%'],
            label: {
              show: false
            },
            labelLine: {
              show: false
            },
            data: [
              {
                value: this.counter.total_count_change_secret_automation,
                name: this.$t('BaseAccountChangeSecret')
              },
              {
                value: this.counter.total_count_push_account_automation,
                name: this.$t('BaseAccountPush')
              },
              {
                value: this.counter.total_count_gathered_account_automation,
                name: this.$t('DiscoverAccounts')
              },
              {
                value: this.counter.total_count_backup_account_automation,
                name: this.$t('AccountBackup')
              },
              {
                value: this.counter.total_count_integration_application,
                name: this.$t('RelevantApp')
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
      return this.$axios.get('/api/v1/accounts/pam-dashboard/', {
        params: {
          total_count_change_secret_automation: 1,
          total_count_gathered_account_automation: 1,
          total_count_push_account_automation: 1,
          total_count_backup_account_automation: 1,
          total_count_integration_application: 1
        }
      })
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
    padding: 1.25rem;

    .content {
      justify-content: flex-start;
      padding: unset;
    }
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
      height: 226px;
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
