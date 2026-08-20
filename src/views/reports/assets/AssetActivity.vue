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
            data-report-name="UserAssetActivity"
          >
            <div class="chart-container-title">
              <div class="chart-container-title-text">{{ $t('UserAssetActivity') }}</div>
              <UserAssetActivity embedded :days="days" :metrics="user_asset_activity_metrics" />
            </div>
          </div>

          <div
            class="chart-container"
            data-report-type="chart"
            data-report-name="DistributionOfAssetLoginMethods"
          >
            <div class="chart-container-title">
              <div class="chart-container-title-text">
                {{ $t('DistributionOfAssetLoginMethods') }}
              </div>
              <div class="chart">
                <Echart :options="LoginEntryOptions" :autoresize="true" />
              </div>
            </div>
          </div>

          <div
            class="chart-container"
            data-report-type="chart"
            data-report-name="RemoteLoginProtocolUsageDistribution"
          >
            <div class="chart-container-title">
              <div class="chart-container-title-text">
                {{ $t('RemoteLoginProtocolUsageDistribution') }}
              </div>
              <div class="chart">
                <Echart :options="LoginProtocolOptions" :autoresize="true" />
              </div>
            </div>
          </div>

          <div
            class="chart-container"
            data-report-type="chart"
            data-report-name="OperatingSystemDistributionOfLoginAssets"
          >
            <div class="chart-container-title">
              <div class="chart-container-title-text">
                {{ $t('OperatingSystemDistributionOfLoginAssets') }}
              </div>
              <div class="chart">
                <Echart :options="LoginOSOptions" :autoresize="true" />
              </div>
            </div>
          </div>

          <div
            class="chart-container full-width"
            data-report-type="chart"
            data-report-name="AssetLoginTrends"
          >
            <div class="chart-container-title">
              <div class="chart-container-title-text">{{ $t('AssetLoginTrends') }}</div>
              <div class="chart">
                <Echart ref="loginTrend" :options="loginTrendOptions" :autoresize="true" />
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #table>
        <div v-if="showTable" class="full-width">
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
import BaseReport from '@/views/reports/base/BaseReport.vue'
import SummaryCountCard from '@/components/Dashboard/SummaryCountCard.vue'
import UserAssetActivity from '@/views/reports/console/UserAssetActivity.vue'
import * as echarts from 'echarts'
import Echart from '@/components/Dashboard/Echart.vue'
import { colorToRgba } from '@/utils/theme/color'
import { getDistributionOptions, mixColors } from '@/views/reports/const'
import reportPageMixin from '@/views/reports/base/reportPageMixin'
import ReportToolbar from '@/views/reports/base/ReportToolbar.vue'

export default {
  components: {
    UserAssetActivity,
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
      title: this.$t('AssetActivityReport'),
      name: 'AssetReport',
      charts: [
        { name: 'Overview', title: this.$t('Overview') },
        { name: 'UserAssetActivity', title: this.$t('UserAssetActivity') },
        {
          name: 'DistributionOfAssetLoginMethods',
          title: this.$t('DistributionOfAssetLoginMethods')
        },
        {
          name: 'RemoteLoginProtocolUsageDistribution',
          title: this.$t('RemoteLoginProtocolUsageDistribution')
        },
        {
          name: 'OperatingSystemDistributionOfLoginAssets',
          title: this.$t('OperatingSystemDistributionOfLoginAssets')
        },
        { name: 'AssetLoginTrends', title: this.$t('AssetLoginTrends') }
      ],
      tables: [
        { name: 'Overview', title: this.$t('Overview') },
        { name: 'UserAssetActivity', title: this.$t('UserAssetActivity') },
        {
          name: 'DistributionOfAssetLoginMethods',
          title: this.$t('DistributionOfAssetLoginMethods')
        },
        {
          name: 'RemoteLoginProtocolUsageDistribution',
          title: this.$t('RemoteLoginProtocolUsageDistribution')
        },
        {
          name: 'OperatingSystemDistributionOfLoginAssets',
          title: this.$t('OperatingSystemDistributionOfLoginAssets')
        },
        { name: 'AssetLoginTrends', title: this.$t('AssetLoginTrends') }
      ],
      days: localStorage.getItem(this.name) || '7',
      session_stats: {
        total: 0,
        asset_count: 0,
        user_count: 0
      },
      pie: {
        asset_login_by_type: [{ name: this.$t('Nothing'), value: 0 }],
        asset_login_by_from: [{ name: this.$t('Nothing'), value: 0 }],
        asset_login_by_protocol: [{ name: this.$t('Nothing'), value: 0 }]
      },
      asset_login_log_metrics: {
        dates_metrics_date: [],
        dates_metrics_total: [0]
      },
      user_asset_activity_metrics: {
        dates_metrics_date: [],
        dates_metrics_total_count_active_users: [0],
        dates_metrics_total_count_active_assets: [0]
      }
    }
  },
  computed: {
    totalData() {
      return [
        {
          title: this.$t('Session'),
          body: {
            count: this.session_stats.total
          }
        },
        {
          title: this.$t('Asset'),
          body: {
            count: this.session_stats.asset_count
          }
        },
        {
          title: this.$t('User'),
          body: {
            count: this.session_stats.user_count
          }
        }
      ]
    },
    LoginEntryOptions() {
      return getDistributionOptions(this.pie.asset_login_by_from, this.$t('Total'))
    },
    LoginProtocolOptions() {
      return getDistributionOptions(this.pie.asset_login_by_protocol, this.$t('Total'))
    },
    LoginOSOptions() {
      return getDistributionOptions(this.pie.asset_login_by_type, this.$t('Total'))
    },
    loginTrendOptions() {
      const { primary } = mixColors()
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
            data: this.asset_login_log_metrics.dates_metrics_date
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
            name: this.$t('ConnectionCount'),
            type: 'line',
            smooth: true,
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(
                  0,
                  0,
                  0,
                  1,
                  [
                    {
                      offset: 0,
                      color: colorToRgba(primary, 0.3)
                    },
                    {
                      offset: 0.6,
                      color: colorToRgba(primary, 0.1)
                    },
                    {
                      offset: 0.8,
                      color: colorToRgba(primary, 0.05)
                    }
                  ],
                  false
                ),
                shadowColor: colorToRgba(primary, 0.08),
                shadowBlur: 6
              }
            },
            data: this.asset_login_log_metrics.dates_metrics_total
          }
        ]
      }
    }
  },
  async mounted() {
    await this.getData()
  },
  methods: {
    conversionData(data) {
      return data.map((item) => {
        return {
          name: item.label,
          value: item.total
        }
      })
    },
    setPieData(key, rawData) {
      const converted = this.conversionData(rawData)
      if (converted.length > 0) {
        this.pie[key] = converted
      } else {
        this.pie[key] = [{ name: this.$t('Nothing'), value: 0 }]
      }
    },
    async getData() {
      const data = await this.fetchReportData('/api/v1/reports/reports/asset-activity/')
      await this.loadTableData('/api/v1/reports/reports/asset-activity/')
      this.session_stats.total = data.session_stats.total
      this.session_stats.asset_count = data.session_stats.asset_count
      this.session_stats.user_count = data.session_stats.user_count
      this.asset_login_log_metrics.dates_metrics_date =
        data.asset_login_log_metrics.dates_metrics_date
      this.asset_login_log_metrics.dates_metrics_total =
        data.asset_login_log_metrics.dates_metrics_total
      this.user_asset_activity_metrics.dates_metrics_date =
        data.user_asset_activity_metrics?.dates_metrics_date || []
      this.user_asset_activity_metrics.dates_metrics_total_count_active_users =
        data.user_asset_activity_metrics?.dates_metrics_total_count_active_users || []
      this.user_asset_activity_metrics.dates_metrics_total_count_active_assets =
        data.user_asset_activity_metrics?.dates_metrics_total_count_active_assets || []

      this.setPieData('asset_login_by_type', data.asset_login_by_type)
      this.setPieData('asset_login_by_from', data.asset_login_by_from)
      this.setPieData('asset_login_by_protocol', data.asset_login_by_protocol)
    }
  }
}
</script>

<style lang="scss" scoped></style>
