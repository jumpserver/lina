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
            class="chart-container full-width"
            data-report-type="chart"
            data-report-name="AssetTypeDistribution"
          >
            <div class="chart-container-title">
              <div class="chart-container-title-text">{{ $t('AssetTypeDistribution') }}</div>
              <div class="chart">
                <Echart :options="AssetTypeOptions" :autoresize="true" />
              </div>
            </div>
          </div>
          <div
            class="chart-container full-width"
            data-report-type="chart"
            data-report-name="WeeklyGrowthTrend"
          >
            <div class="chart-container-title">
              <div class="chart-container-title-text">{{ $t('WeeklyGrowthTrend') }}</div>
              <div class="chart">
                <Echart :options="AddedAssetOptions" :autoresize="true" />
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
import BaseReport from '../base/BaseReport.vue'
import SummaryCountCard from '@/components/Dashboard/SummaryCountCard.vue'
import * as echarts from 'echarts'
import Echart from '@/components/Dashboard/Echart.vue'
import { getReportChartTheme, mixColors } from '@/views/reports/const'
import reportPageMixin from '@/views/reports/base/reportPageMixin'
import ReportToolbar from '@/views/reports/base/ReportToolbar.vue'

export default {
  components: {
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
      title: this.$t('AssetStatisticsReport'),
      name: 'AssetStatistics',
      charts: [
        { name: 'Overview', title: this.$t('Overview') },
        { name: 'AssetTypeDistribution', title: this.$t('AssetTypeDistribution') },
        { name: 'WeeklyGrowthTrend', title: this.$t('WeeklyGrowthTrend') }
      ],
      tables: [
        { name: 'Overview', title: this.$t('Overview') },
        { name: 'AssetTypeDistribution', title: this.$t('AssetTypeDistribution') },
        { name: 'WeeklyGrowthTrend', title: this.$t('WeeklyGrowthTrend') }
      ],
      days: localStorage.getItem(this.name) || '7',
      asset_stats: {
        total: 0,
        active: 0,
        connected: 0,
        zone: 0,
        directory_services: 0,
        platform_count: 0
      },
      assets_by_type_category: {
        categories: [],
        typeLabelMap: new Map(),
        series: []
      },
      added_asset_metrics: {
        dates_metrics_date: [],
        dates_metrics_total: {}
      }
    }
  },
  computed: {
    totalData() {
      return [
        {
          title: this.$t('Total'),
          body: {
            route: { name: `AssetList` },
            count: this.asset_stats.total
          }
        },
        {
          title: this.$t('Active'),
          body: {
            count: this.asset_stats.active
          }
        },
        {
          title: this.$t('Connectable'),
          body: {
            count: this.asset_stats.connected
          }
        },
        {
          title: this.$t('LinkedDomains'),
          body: {
            count: this.asset_stats.zone
          }
        },
        {
          title: this.$t('ConnectedDirectoryServices'),
          body: {
            count: this.asset_stats.directory_services
          }
        },
        {
          title: this.$t('Platform'),
          body: {
            count: this.asset_stats.platform_count
          }
        }
      ]
    },
    AssetTypeOptions() {
      const { palette, textSecondary, border } = getReportChartTheme()
      return {
        color: palette,
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params) => {
            const currentCategoryIndex = params[0].dataIndex
            const filtered = params.filter((p) => p.data > 0)
            let result = `${this.assets_by_type_category.categories[currentCategoryIndex]}<br/>`
            filtered.forEach((p) => {
              result += `${p.marker}${p.seriesName}: ${p.value}<br/>`
            })
            return result
          },
          appendToBody: true
        },
        legend: {
          top: 0,
          left: 0,
          icon: 'rect',
          itemWidth: 10,
          itemHeight: 10,
          itemGap: 12,
          textStyle: {
            color: textSecondary,
            fontSize: 12
          },
          data: Array.from(this.assets_by_type_category.typeLabelMap.values())
        },
        grid: {
          left: '3%',
          right: '4%',
          top: 42,
          bottom: 8,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: this.assets_by_type_category.categories,
          axisLine: {
            lineStyle: {
              color: border
            }
          },
          axisLabel: {
            color: textSecondary
          },
          axisTick: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          axisLabel: {
            color: textSecondary
          },
          axisTick: {
            show: false
          },
          splitLine: {
            lineStyle: {
              color: border
            }
          }
        },
        series: this.assets_by_type_category.series.map((series) => ({
          ...series,
          barMaxWidth: 32,
          itemStyle: {
            borderRadius: 0
          }
        })),
        barCategoryGap: '70%'
      }
    },
    AddedAssetOptions() {
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
                // 坐标轴颜色
                color: '#8F959E'
              }
            },
            axisTick: {
              show: false
            },
            data: this.added_asset_metrics.dates_metrics_date
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
            name: this.$t('Asset'),
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
            data: this.added_asset_metrics.dates_metrics_total
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
      const data = await this.fetchReportData('/api/v1/reports/reports/asset-statistic/')
      this.asset_stats.total = data.asset_stats?.total || 0
      this.asset_stats.active = data.asset_stats?.active || 0
      this.asset_stats.connected = data.asset_stats?.connected || 0
      this.asset_stats.zone = data.asset_stats?.zone || 0
      this.asset_stats.directory_services = data.asset_stats?.directory_services || 0
      this.asset_stats.platform_count = data.asset_stats?.platform_count || 0
      this.added_asset_metrics.dates_metrics_date =
        data.added_asset_metrics?.dates_metrics_date || []
      this.added_asset_metrics.dates_metrics_total =
        data.added_asset_metrics?.dates_metrics_total || []

      const assetsByTypeCategory = data.assets_by_type_category || {}

      const categories = Object.keys(assetsByTypeCategory)

      const typeLabelMap = new Map()
      const typeSet = new Set()

      categories.forEach((cat) => {
        assetsByTypeCategory[cat].forEach((item) => {
          typeSet.add(item.type)
          typeLabelMap.set(item.type, item.label)
        })
      })

      const types = Array.from(typeSet)

      const series = types.map((type) => {
        const data = categories.map((cat) => {
          const found = assetsByTypeCategory[cat].find((item) => item.type === type)
          return found ? found.total : 0
        })

        return {
          name: typeLabelMap.get(type),
          type: 'bar',
          stack: this.$t('Total'),
          data
        }
      })
      this.assets_by_type_category.categories = categories
      this.assets_by_type_category.typeLabelMap = typeLabelMap
      this.assets_by_type_category.series = series

      // load table data using shared mixin logic (will build tables from chart payload or fallback to export=table)
      await this.loadTableData('/api/v1/reports/reports/asset-statistic/')
    }
  }
}
</script>

<style lang="scss" scoped></style>
