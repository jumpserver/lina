<template>
  <div>
    <BaseReport
      :title="reportTitle"
      :nav="nav"
      :name="name"
      :charts="charts"
      :tables="tables"
      :show-display-mode-toggle="true"
      v-model:display-mode="displayMode"
      :current-days="currentFilters.days"
      v-bind="$attrs"
    >
      <template #toolbar>
        <ReportToolbar
          :filters="currentFilters"
          class="chart-container full-width report-toolbar-wrap"
          @filter-change="handleToolbarFilterChange"
        />
      </template>
      <template #default>
        <div v-if="showChart" class="charts-grid">
          <div
            class="chart-container full-width"
            data-report-type="chart"
            data-report-name="Overview"
          >
            <div class="chart-container-title">
              <div class="chart-container-title-text">{{ $t('Overview') }}</div>
              <SummaryCountCard :items="totalData" />
            </div>
          </div>

          <div
            data-report-type="chart"
            data-report-name="RiskyAccount"
            class="chart-container full-width"
          >
            <div class="chart-container-title">
              <div class="chart-container-title-text">{{ $t('RiskyAccount') }}</div>
              <RiskSummary :is-title="false" class="risk-summary" />
            </div>
          </div>

          <div
            class="chart-container full-width"
            data-report-type="chart"
            data-report-name="TaskExecutionTrends"
          >
            <div class="chart-container-title">
              <div class="chart-container-title-text">{{ $t('TaskExecutionTrends') }}</div>
              <div class="chart">
                <Echart :options="ExecutionMetricsOptions" :autoresize="true" />
              </div>
            </div>
          </div>

          <div
            class="chart-container full-width"
            data-report-type="chart"
            data-report-name="AccountResult"
          >
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
        </div>
      </template>
      <template #table>
        <div v-if="showTable" class="full-width">
          <div
            data-report-type="table"
            data-report-name="RiskyAccount"
            class="report-table-wrap full-width"
          >
            <el-card class="report-card" shadow="hover">
              <div class="chart-container-title">
                <div class="chart-container-title-text">{{ $t('RiskyAccount') }}</div>
              </div>
              <div class="report-card-body">
                <el-table :data="riskCounter" border>
                  <el-table-column :label="$t('Name')" prop="name" min-width="200" />
                  <el-table-column :label="$t('Count')" prop="value" min-width="120" />
                </el-table>
              </div>
            </el-card>
          </div>
          <div v-if="Array.isArray(tableData)" class="report-tables full-width">
            <div
              v-if="tableData.length"
              class="report-table-wrap chart-container full-width"
              data-report-type="table"
              :data-report-name="tableData[0].name"
            >
              <div v-if="tableData[0].name" class="chart-container-title">
                <div class="chart-container-title-text">{{ tableData[0].name }}</div>
              </div>
              <el-table :data="tableData[0].rows" border>
                <el-table-column
                  v-for="column in tableData[0].columns"
                  :key="column.key"
                  :label="column.label"
                  :prop="column.key"
                  min-width="140"
                />
              </el-table>
            </div>
            <div
              v-for="(t, idx) in tableData.slice(1)"
              :key="t.name || idx"
              class="report-table-wrap chart-container full-width"
              data-report-type="table"
              :data-report-name="t.name"
            >
              <div v-if="t.name" class="chart-container-title">
                <div class="chart-container-title-text">{{ t.name }}</div>
              </div>
              <el-table :data="t.rows" border>
                <el-table-column
                  v-for="column in t.columns"
                  :key="column.key"
                  :label="column.label"
                  :prop="column.key"
                  min-width="140"
                />
              </el-table>
            </div>
          </div>
          <div v-else>
            <el-table :data="tableData.rows" border>
              <el-table-column
                v-for="column in tableData.columns"
                :key="column.key"
                :label="column.label"
                :prop="column.key"
                min-width="140"
              />
            </el-table>
          </div>
        </div>
      </template>
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
      charts: [
        { name: 'Overview', title: this.$t('Overview') },
        { name: 'RiskyAccount', title: this.$t('RiskyAccount') },
        { name: 'TaskExecutionTrends', title: this.$t('TaskExecutionTrends') },
        { name: 'AccountResult', title: this.$t('AccountResult') }
      ],
      tables: [
        { name: 'Overview', title: this.$t('Overview') },
        { name: 'RiskyAccount', title: this.$t('RiskyAccount') },
        { name: 'TaskExecutionTrends', title: this.$t('TaskExecutionTrends') },
        { name: 'AccountResult', title: this.$t('AccountResult') }
      ],
      description: '-',
      days: localStorage.getItem(this.name) || '7',
      automation_stats: {
        push: 0,
        check: 0,
        backup: 0,
        collect: 0,
        change_secret: 0
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
      },
      riskCounter: []
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
          top: 0,
          left: 0,
          icon: 'rect',
          data: this.execution_metrics.legend,
          itemWidth: 10,
          itemHeight: 10,
          itemGap: 12
        },
        grid: {
          left: '3%',
          right: '4%',
          top: 42,
          bottom: 8,
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
  async mounted() {
    await this.getData()
  },
  methods: {
    async getData() {
      const data = await this.fetchReportData('/api/v1/reports/reports/account-automation/')
      await this.loadTableData('/api/v1/reports/reports/account-automation/')
      try {
        const riskData = await this.$axios.get('/api/v1/accounts/pam-dashboard/', {
          params: {
            total_long_time_no_login_accounts: 1,
            total_new_found_accounts: 1,
            total_groups_changed_accounts: 1,
            total_sudoers_changed_accounts: 1,
            total_authorized_keys_changed_accounts: 1,
            total_account_deleted_accounts: 1,
            total_password_expired_accounts: 1,
            total_long_time_password_accounts: 1,
            total_weak_password_accounts: 1,
            total_leaked_password_accounts: 1,
            total_repeated_password_accounts: 1
          }
        })
        this.riskCounter = [
          { name: this.$t('NoLoginLongTime'), value: riskData.total_long_time_no_login_accounts },
          { name: this.$t('NewAccountsFound'), value: riskData.total_new_found_accounts },
          { name: this.$t('GroupsChanged'), value: riskData.total_groups_changed_accounts },
          { name: this.$t('SudoersChanged'), value: riskData.total_sudoers_changed_accounts },
          {
            name: this.$t('AuthorizedKeysChanged'),
            value: riskData.total_authorized_keys_changed_accounts
          },
          { name: this.$t('AccountDeleted'), value: riskData.total_account_deleted_accounts },
          { name: this.$t('PasswordExpired'), value: riskData.total_password_expired_accounts },
          { name: this.$t('LongTimePassword'), value: riskData.total_long_time_password_accounts },
          { name: this.$t('WeakPassword'), value: riskData.total_weak_password_accounts },
          { name: this.$t('LeakedPassword'), value: riskData.total_leaked_password_accounts },
          { name: this.$t('RepeatedPassword'), value: riskData.total_repeated_password_accounts }
        ]
      } catch (e) {
        this.riskCounter = []
      }
      this.automation_stats.push = data.automation_stats.push
      this.automation_stats.check = data.automation_stats.check
      this.automation_stats.backup = data.automation_stats.backup
      this.automation_stats.collect = data.automation_stats.collect
      this.automation_stats.change_secret = data.automation_stats.change_secret
      this.execution_metrics.dates_metrics_date = data.execution_metrics.dates_metrics_date

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
        showSymbol: true
      }))

      const keys = Object.keys(data.execution_metrics.data)
      this.execution_metrics.legend = keys
      this.execution_metrics.series = seriesData
      this.account_result_metrics.dates_metrics_date =
        data.account_result_metrics?.dates_metrics_date || []
      this.account_result_metrics.dates_metrics_total_count_success =
        data.account_result_metrics?.dates_metrics_total_count_success || []
      this.account_result_metrics.dates_metrics_total_count_failed =
        data.account_result_metrics?.dates_metrics_total_count_failed || []
    }
  }
}
</script>

<style lang="scss" scoped></style>
