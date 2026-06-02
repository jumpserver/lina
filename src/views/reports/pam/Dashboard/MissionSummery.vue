<template>
  <div class="box">
    <div class="header">
      <Title :config="config" />
    </div>

    <div class="chart-content">
      <!-- eslint-disable-next-line -->
      <Echart ref="chartRef" :options="chartOption" :autoresize="true"/>
    </div>
  </div>
</template>

<script>
import Title from '@/components/Dashboard/Title.vue'
import Echart from '@/components/Dashboard/Echart.vue'

export default {
  name: 'MissionSummery',
  components: { Title, Echart },
  data() {
    return {
      config: {
        title: this.$t('TaskSummary'),
        tip: this.$t('TaskSummary')
      },
      counter: {
        total_count_change_secret_automation: 0,
        total_count_push_account_automation: 0,
        total_count_gathered_account_automation: 0,
        total_count_backup_account_automation: 0,
        total_count_integration_application: 0
      }
    }
  },
  computed: {
    chartOption() {
      return {
        tooltip: {
          trigger: 'item',
          formatter: params => {
            return `${params.name}: ${params.value} (${params.percent}%)`
          }
        },
        legend: {
          icon: 'rect',
          itemWidth: 10,
          itemHeight: 10,
          left: '2%'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        series: [
          {
            name: this.$t('TaskSummary'),
            type: 'pie',
            minAngle: 5,
            top: '10%',
            radius: ['45%', '60%'],
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
  async mounted() {
    this.counter = await this.getResourcesCount()
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
    }
  }
}
</script>

<style scoped lang="scss">
.box {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--surface-panel, #fff);
  border: 1px solid var(--color-border, var(--N200));
  border-radius: var(--radius-card, 8px);

  .header {
    padding: var(--space-4, 16px) var(--space-4, 16px) 0;
    margin-bottom: var(--space-3, 12px);
  }

  .chart-content {
    flex: 1;
    min-height: 0;
    padding: 0 var(--space-4, 16px) var(--space-4, 16px);
    display: flex;
    align-items: center;
    justify-content: center;

    :deep(.echarts) {
      height: 240px;
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
