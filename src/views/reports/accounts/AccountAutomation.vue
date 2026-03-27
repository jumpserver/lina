<template>
  <div>
    <BaseReport
      :title="title"
      :nav="nav"
      :name="name"
      :show-display-mode-toggle="true"
      :display-mode.sync="displayMode"
      v-bind="$attrs"
    >
      <div class="charts-grid">
        <template v-if="showChart">
          <div class="chart-container full-width">
            <div class="chart-container-title">
              <div class="chart-container-title-text">{{ $t('Overview') }}</div>
              <SummaryCountCard
                :items="totalData"
              />
            </div>
          </div>

          <ReportToolbar
            :filter-field="filterField"
            :filter-label="filterLabel"
            :filter-select="getFilterSelect()"
            :filters="currentFilters"
            :is-custom-report="isCustomReport"
            :show-date-controls="false"
            class="chart-container full-width report-toolbar-wrap"
            @filter-change="handleToolbarFilterChange"
          />

          <div v-if="!isCustomReport" class="chart-container full-width">
            <div class="chart-container-title">
              <div class="chart-container-title-text">{{ $t('RiskyAccount') }}</div>
              <RiskSummary :is-title="false" class="risk-summary" />
            </div>
          </div>

          <div class="chart-container full-width">
            <div class="chart-container-title">
              <div class="chart-container-title-text">{{ $t('TaskExecutionTrends') }}</div>
              <div class="chart">
                <Echart
                  :options="ExecutionMetricsOptions"
                  :autoresize="true"
                />
              </div>
            </div>
          </div>

          <div class="chart-container full-width">
            <div class="chart-container-title">
              <div class="chart-container-title-text">{{ $t('AccountResult') }}</div>
              <AccountSummary
                :days="days"
                :disable-box="true"
                :is-title="false"
                :metrics="account_result_metrics"
                class="account-summary"
              />
            </div>
          </div>
        </template>
        <div v-if="showTable" class="full-width">
          <div v-if="Array.isArray(tableData)" class="report-tables full-width">
            <div v-if="tableData.length" class="report-table-wrap full-width">
              <el-card class="report-card" shadow="hover">
                <div v-if="tableData[0].name" class="chart-container-title">
                  <div class="chart-container-title-text">{{ tableData[0].name }}</div>
                </div>
                <div class="report-card-body">
                  <el-table :data="tableData[0].rows" border>
                    <el-table-column v-for="column in tableData[0].columns" :key="column.key" :label="column.label" :prop="column.key" min-width="140" />
                  </el-table>
                </div>
              </el-card>
            </div>
            <ReportToolbar
              v-if="tableData.length"
              :filter-field="filterField"
              :filter-label="filterLabel"
              :filter-select="getFilterSelect()"
              :filters="currentFilters"
              :is-custom-report="isCustomReport"
              :show-date-controls="false"
              class="chart-container full-width report-toolbar-wrap"
              @filter-change="handleToolbarFilterChange"
            />
            <div v-for="(t, idx) in tableData.slice(1)" :key="t.name || idx" class="report-table-wrap full-width">
              <el-card class="report-card" shadow="hover">
                <div v-if="t.name" class="chart-container-title">
                  <div class="chart-container-title-text">{{ t.name }}</div>
                </div>
                <div class="report-card-body">
                  <el-table :data="t.rows" border>
                    <el-table-column v-for="column in t.columns" :key="column.key" :label="column.label" :prop="column.key" min-width="140" />
                  </el-table>
                </div>
              </el-card>
            </div>
          </div>
          <div v-else>
            <ReportToolbar
              :filter-field="filterField"
              :filter-label="filterLabel"
              :filter-select="getFilterSelect()"
              :filters="currentFilters"
              :is-custom-report="isCustomReport"
              :show-date-controls="false"
              class="chart-container full-width report-toolbar-wrap"
              @filter-change="handleToolbarFilterChange"
            />
            <el-table :data="tableData.rows" border>
              <el-table-column v-for="column in tableData.columns" :key="column.key" :label="column.label" :prop="column.key" min-width="140" />
            </el-table>
          </div>
        </div>
      </div>
    </BaseReport>
  </div>
</template>

<script>
import BaseReport from '../base/BaseReport.vue'
import SummaryCountCard from '@/components/Dashboard/SummaryCountCard.vue'
import * as echarts from 'echarts'
import Echart from '@/components/Dashboard/Echart.vue'
import AccountSummary from '@/views/reports/pam/ChangeSecret/AccountSummary.vue'
import RiskSummary from '@/views/reports/pam/Dashboard/RiskSummary.vue'
import reportPageMixin from '@/views/reports/base/reportPageMixin'
import ReportToolbar from '@/views/reports/base/ReportToolbar.vue'

export default {
  components: {
    RiskSummary,
    AccountSummary,
    SummaryCountCard,
    BaseReport,
    Echart,
    ReportToolbar
  },
  mixins: [reportPageMixin],
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
      days: localStorage.getItem(this.name) || '7',
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
      },
      account_result_metrics: {
        dates_metrics_date: [],
        dates_metrics_total_count_success: [0],
        dates_metrics_total_count_failed: [0]
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
    },
    async getData() {
      const data = await this.fetchReportData('/api/v1/reports/reports/account-automation/')
      await this.loadTableData('/api/v1/reports/reports/account-automation/')
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
      this.$set(this.account_result_metrics, 'dates_metrics_date', data.account_result_metrics?.dates_metrics_date || [])
      this.$set(this.account_result_metrics, 'dates_metrics_total_count_success', data.account_result_metrics?.dates_metrics_total_count_success || [])
      this.$set(this.account_result_metrics, 'dates_metrics_total_count_failed', data.account_result_metrics?.dates_metrics_total_count_failed || [])
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
