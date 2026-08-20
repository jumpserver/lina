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
            class="chart-container"
            data-report-type="chart"
            data-report-name="AccountCreationSourceDistribution"
          >
            <div class="chart-container-title">
              <div class="chart-container-title-text">
                {{ $t('AccountCreationSourceDistribution') }}
              </div>
              <div class="chart">
                <Echart :options="SourceOptions" :autoresize="true" />
              </div>
            </div>
          </div>
          <div
            class="chart-container"
            data-report-type="chart"
            data-report-name="AccountConnectivityStatusDistribution"
          >
            <div class="chart-container-title">
              <div class="chart-container-title-text">
                {{ $t('AccountConnectivityStatusDistribution') }}
              </div>
              <div class="chart">
                <Echart :options="ConnectivityOptions" :autoresize="true" />
              </div>
            </div>
          </div>
          <div
            class="chart-container full-width"
            data-report-type="chart"
            data-report-name="AccountPasswordChangeTrends"
          >
            <div class="chart-container-title">
              <div class="chart-container-title-text">{{ $t('AccountPasswordChangeTrends') }}</div>
              <div class="chart">
                <Echart :options="ChangeSecretOptions" :autoresize="true" />
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #table>
        <div v-if="showTable" class="full-width">
          <div v-if="Array.isArray(tableData)" class="report-tables full-width">
            <template v-for="(t, idx) in tableData">
              <div
                v-if="rankingTableConfigs[t.name]"
                :key="'rank-' + idx"
                class="report-table-wrap chart-container full-width"
                data-report-type="table"
                :data-report-name="t.name"
              >
                <div class="chart-container-title">
                  <div class="chart-container-title-text">{{ t.name }}</div>
                </div>
                <RankTable :config="rankingTableConfigs[t.name]" />
              </div>
              <div
                v-else
                :key="t.name || idx"
                class="report-table-wrap chart-container full-width"
                data-report-type="table"
                :data-report-name="t.name"
              >
                <div v-if="t.name" class="chart-container-title">
                  <div class="chart-container-title-text">{{ t.name }}</div>
                </div>
                <div class="report-card-body">
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
            </template>
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
import { getDistributionOptions, mixColors } from '@/views/reports/const'
import RankTable from '@/views/reports/users/components/RankTable.vue'
import reportPageMixin from '@/views/reports/base/reportPageMixin'
import ReportToolbar from '@/views/reports/base/ReportToolbar.vue'

export default {
  components: {
    RankTable,
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
      title: this.$t('AccountStatisticsReport'),
      name: 'AccountStatistics',
      charts: [
        { name: 'Overview', title: this.$t('Overview') },
        {
          name: 'AccountCreationSourceDistribution',
          title: this.$t('AccountCreationSourceDistribution')
        },
        {
          name: 'AccountConnectivityStatusDistribution',
          title: this.$t('AccountConnectivityStatusDistribution')
        },
        { name: 'AccountPasswordChangeTrends', title: this.$t('AccountPasswordChangeTrends') }
      ],
      tables: [
        { name: 'Overview', title: this.$t('Overview') },
        {
          name: 'AccountCreationSourceDistribution',
          title: this.$t('AccountCreationSourceDistribution')
        },
        {
          name: 'AccountConnectivityStatusDistribution',
          title: this.$t('AccountConnectivityStatusDistribution')
        },
        { name: 'AccountPasswordChangeTrends', title: this.$t('AccountPasswordChangeTrends') },
        { name: 'RankByNumberOfAssetAccounts', title: this.$t('RankByNumberOfAssetAccounts') },
        { name: 'AccountAndPasswordChangeRank', title: this.$t('AccountAndPasswordChangeRank') }
      ],
      days: localStorage.getItem(this.name) || '7',
      account_stats: {
        total: 0,
        active: 0,
        connected: 0,
        su_from: 0,
        date_change_secret: 0,
        template_total: 0
      },
      change_secret_account_metrics: {
        dates_metrics_date: [],
        dates_metrics_total: {}
      },
      config: {
        source_pie: [],
        top_assets: [],
        by_connectivity: [],
        top10_asset_accounts: {
          data: [],
          columns: [
            {
              prop: 'asset__name',
              label: this.$t('Asset')
            },
            {
              prop: 'account_count',
              label: this.$t('AccountTotal')
            }
          ]
        },
        top10_version_accounts: {
          data: [],
          columns: [
            {
              prop: 'display_key',
              label: this.$t('Asset')
            },
            {
              prop: 'version',
              label: this.$t('Version')
            }
          ]
        }
      }
    }
  },
  computed: {
    rankingTableConfigs() {
      return {
        [this.$t('RankByNumberOfAssetAccounts')]: this.config.top10_asset_accounts,
        [this.$t('AccountAndPasswordChangeRank')]: this.config.top10_version_accounts
      }
    },
    totalData() {
      return [
        {
          title: this.$t('Total'),
          body: {
            count: this.account_stats.total
          }
        },
        {
          title: this.$t('Active'),
          body: {
            count: this.account_stats.active
          }
        },
        {
          title: this.$t('Connectable'),
          body: {
            count: this.account_stats.connected
          }
        },
        {
          title: this.$t('SuFrom'),
          body: {
            count: this.account_stats.su_from
          }
        },
        {
          title: this.$t('ResetSecret'),
          body: {
            count: this.account_stats.date_change_secret
          }
        },
        {
          title: this.$t('BaseAccountTemplate'),
          body: {
            count: this.account_stats.template_total
          }
        }
      ]
    },
    SourceOptions() {
      return getDistributionOptions(this.config.source_pie, this.$t('Total'))
    },
    ConnectivityOptions() {
      return getDistributionOptions(this.config.by_connectivity, this.$t('Total'))
    },
    ChangeSecretOptions() {
      const { primary, TwoLevelColor, ThreeLevelColor, shadowColor } = mixColors()
      return {
        title: {
          show: false
        },
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
        color: [primary, '#F3B44B'],
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
            data: this.change_secret_account_metrics.dates_metrics_date
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
        series: [
          {
            name: this.$t('Account'),
            type: 'line',
            smooth: true,
            areaStyle: {
              // 区域填充样式
              normal: {
                color: new echarts.graphic.LinearGradient(
                  0,
                  0,
                  0,
                  1,
                  [
                    {
                      offset: 0,
                      color: primary
                    },
                    {
                      offset: 0.6,
                      color: TwoLevelColor
                    },
                    {
                      offset: 0.8,
                      color: ThreeLevelColor
                    }
                  ],
                  false
                ),
                shadowColor: shadowColor,
                shadowBlur: 5
              }
            },
            data: this.change_secret_account_metrics.dates_metrics_total
          }
        ]
      }
    }
  },
  async mounted() {
    await this.getData()
  },
  methods: {
    async getData() {
      const data = await this.fetchReportData('/api/v1/reports/reports/account-statistic/')
      this.account_stats.total = data.account_stats?.total || 0
      this.account_stats.active = data.account_stats?.active || 0
      this.account_stats.connected = data.account_stats?.connected || 0
      this.account_stats.su_from = data.account_stats?.su_from || 0
      this.account_stats.date_change_secret = data.account_stats?.date_change_secret || 0
      this.account_stats.template_total = data.account_stats?.template_total || 0
      this.change_secret_account_metrics.dates_metrics_date =
        data.change_secret_account_metrics?.dates_metrics_date || []
      this.change_secret_account_metrics.dates_metrics_total =
        data.change_secret_account_metrics?.dates_metrics_total || []

      const accountSourcePie = data.source_pie || []
      if (accountSourcePie.length !== 0) {
        this.config.source_pie = accountSourcePie
      }

      const by_connectivity = (data.by_connectivity || []).map((item) => {
        return {
          name: item.label,
          value: item.total
        }
      })
      this.config.by_connectivity = by_connectivity
      this.config.top10_asset_accounts.data = data.top_assets || []
      this.config.top10_version_accounts.data = data.top_version_accounts || []

      await this.loadTableData('/api/v1/reports/reports/account-statistic/')
    }
  }
}
</script>

<style lang="scss" scoped></style>
