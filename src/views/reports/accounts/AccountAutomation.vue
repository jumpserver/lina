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

        <div class="chart-container full-width">
          <div class="chart-container-title">
            <div class="chart-container-title-text">{{ $t('RiskyAccount') }}</div>
            <RiskSummary :is-title="false" class="risk-summary" />
          </div>
        </div>

        <SwitchDate class="switch-date" @change="onChange" />
        <div class="chart-container full-width">
          <div class="chart-container-title">
            <div class="chart-container-title-text">{{ $t('TaskExecutionTrends') }}</div>
            <div class="chart">
              <echarts
                :options="ExecutionMetricsOptions"
                :autoresize="true"
              />
            </div>
          </div>
        </div>

        <div class="chart-container full-width">
          <div class="chart-container-title">
            <div class="chart-container-title-text">{{ $t('AccountResult') }}</div>
            <AccountSummary :days="days" :is-title="false" :disable-box="true" class="account-summary" />
          </div>
        </div>
      </div>
    </BaseReport>
  </div>
</template>

<script>
import BaseReport from '../base/BaseReport.vue'
import SummaryCountCard from '@/components/Dashboard/SummaryCountCard.vue'
import SwitchDate from '@/components/Dashboard/SwitchDate.vue'
import * as echarts from 'echarts'
import AccountSummary from '@/views/reports/pam/ChangeSecret/AccountSummary.vue'
import RiskSummary from '@/views/reports/pam/Dashboard/RiskSummary.vue'

export default {
  components: {
    RiskSummary,
    AccountSummary,
    SwitchDate,
    SummaryCountCard,
    BaseReport
  },
  props: {
    nav: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      title: this.$t('AccountAutomationReport'),
      name: 'AccountAutomationReport',
      description: '-',
      days: localStorage.getItem('reportDays') || '7',
      automation_stats: {
        'push': 0,
        'check': 0,
        'backup': 0,
        'collect': 0,
        'change_secret': 0
      },
      execution_metrics: {
        dates_metrics_date: [],
        legend: [],
        dates_metrics_total: {},
        series: []
      }
    }
  },
  computed: {
    totalData() {
      return [
        {
          title: this.$t('AccountPushList'),
          body: {
            count: this.automation_stats.push
          }
        },
        {
          title: this.$t('RiskDetection'),
          body: {
            count: this.automation_stats.check
          }
        },
        {
          title: this.$t('BaseAccountBackup'),
          body: {
            count: this.automation_stats.backup
          }
        },
        {
          title: this.$t('DiscoverAccounts'),
          body: {
            count: this.automation_stats.collect
          }
        },
        {
          title: this.$t('MenuChangeSecret'),
          body: {
            count: this.automation_stats.change_secret
          }
        }
      ]
    },
    ExecutionMetricsOptions() {
      return {
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
          data: this.execution_metrics.legend,
          itemWidth: 10,
          itemHeight: 10
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
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
            data: this.execution_metrics.dates_metrics_date
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
        series: this.execution_metrics.series
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
      const data = await this.$axios.get(`/api/v1/reports/reports/account-automation/?days=${this.days}`)
      this.$set(this.automation_stats, 'push', data.automation_stats.push)
      this.$set(this.automation_stats, 'check', data.automation_stats.check)
      this.$set(this.automation_stats, 'backup', data.automation_stats.backup)
      this.$set(this.automation_stats, 'collect', data.automation_stats.collect)
      this.$set(this.automation_stats, 'change_secret', data.automation_stats.change_secret)
      this.$set(this.execution_metrics, 'dates_metrics_date', data.execution_metrics.dates_metrics_date)

      const seriesData = Object.entries(data.execution_metrics.data).map(([key, value]) => ({
        name: key,
        type: 'line',
        emphasis: { focus: 'series' },
        smooth: true,
        data: value,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 136, 212, 0.4)' },
            { offset: 1, color: 'rgba(0, 136, 212, 0.05)' }
          ])
        },
        lineStyle: {
          width: 2
        },
        showSymbol: false
      }))

      const keys = Object.keys(data.execution_metrics.data)
      this.$set(this.execution_metrics, 'legend', keys)
      this.$set(this.execution_metrics, 'series', seriesData)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
