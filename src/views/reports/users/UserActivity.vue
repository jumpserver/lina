<template>
  <div>
    <BaseReport
      :title="reportTitle"
      :nav="nav"
      :name="name"
      :charts="charts"
      :tables="tables"
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
            data-report-name="UserLoginTrends"
          >
            <div class="chart-container-title">
              <div class="chart-container-title-text">{{ $t('UserLoginTrends') }}</div>
              <div class="chart">
                <Echart ref="loginTrend" :options="loginTrendOptions" :autoresize="true" />
              </div>
            </div>
          </div>

          <div class="chart-container" data-report-type="chart" data-report-name="LoginSource">
            <div class="chart-container-title">
              <div class="chart-container-title-text">{{ $t('LoginSource') }}</div>
              <div class="chart">
                <Echart :options="LoginSourceOptions" :autoresize="true" />
              </div>
            </div>
          </div>

          <div
            class="chart-container"
            data-report-type="chart"
            data-report-name="VisitTimeDistribution"
          >
            <div class="chart-container-title">
              <div class="chart-container-title-text">{{ $t('VisitTimeDistribution') }}</div>
              <div class="chart">
                <Echart :options="VisitTimeOptions" :autoresize="true" />
              </div>
            </div>
          </div>

          <div
            class="chart-container full-width"
            data-report-type="chart"
            data-report-name="LoginMethodStatistics"
          >
            <div class="chart-container-title">
              <div class="chart-container-title-text">{{ $t('LoginMethodStatistics') }}</div>
              <div class="chart">
                <Echart :options="loginMethodOptions" :autoresize="true" />
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #table>
        <div class="full-width">
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
import * as echarts from 'echarts'
import { colorToRgba } from '@/utils/theme/color'
import { getDistributionOptions, getReportChartTheme, mixColors } from '@/views/reports/const'
import SummaryCountCard from '@/components/Dashboard/SummaryCountCard.vue'
import Echart from '@/components/Dashboard/Echart.vue'
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
      title: this.$t('UserLoginReport'),
      name: 'UserLoginReport',
      charts: [
        {
          name: 'Overview',
          title: this.$t('Overview')
        },
        {
          name: 'UserLoginTrends',
          title: this.$t('UserLoginTrends')
        },
        {
          name: 'LoginSource',
          title: this.$t('LoginSource')
        },
        {
          name: 'VisitTimeDistribution',
          title: this.$t('VisitTimeDistribution')
        },
        {
          name: 'LoginMethodStatistics',
          title: this.$t('LoginMethodStatistics')
        }
      ],
      tables: [
        {
          name: 'Overview',
          title: this.$t('Overview')
        },
        {
          name: 'UserLoginTrends',
          title: this.$t('UserLoginTrends')
        },
        {
          name: 'LoginSource',
          title: this.$t('LoginSource')
        },
        {
          name: 'VisitTimeDistribution',
          title: this.$t('VisitTimeDistribution')
        },
        {
          name: 'LoginMethodStatistics',
          title: this.$t('LoginMethodStatistics')
        }
      ],
      days: localStorage.getItem(this.name) || '7',
      user_stats: {
        total: 0,
        not_enabled_mfa: 0,
        valid: 0,
        first_login: 0,
        face_vector: 0,
        need_update_password: 0
      },
      pie: {
        user_by_source: [{ name: this.$t('Nothing'), value: 0 }]
      },
      config: {
        user_login_failed_metrics: {
          dates_metrics_date: [],
          dates_metrics_total: [0]
        },
        user_login_log_metrics: {
          dates_metrics_date: [],
          dates_metrics_success_total: [0],
          dates_metrics_failure_total: [0]
        },
        user_login_method_metrics: {
          dates_metrics_date: [],
          dates_metrics_total: {}
        },
        user_login_time_metrics: {}
      }
    }
  },
  computed: {
    totalData() {
      const items = [
        {
          key: 'total',
          title: this.$t('Total'),
          body: {
            count: this.user_stats.total
          }
        },
        {
          key: 'not_enabled_mfa',
          title: this.$t('NotEnableMfa'),
          body: {
            count: this.user_stats.not_enabled_mfa
          }
        },
        {
          key: 'first_login',
          title: this.$t('FirstLogin'),
          body: {
            count: this.user_stats.first_login
          }
        },
        {
          key: 'valid',
          title: this.$t('Valid'),
          body: {
            count: this.user_stats.valid
          }
        },
        {
          key: 'face_vector',
          title: this.$t('FaceVector'),
          body: {
            count: this.user_stats.face_vector
          }
        },
        {
          key: 'need_update_password',
          title: this.$t('NeedUpdatePassword'),
          body: {
            count: this.user_stats.need_update_password
          }
        }
      ]
      return items.filter((item) => !(item.key === 'face_vector' && Number(item.body.count) === 0))
    },
    LoginSourceOptions() {
      return getDistributionOptions(this.pie.user_by_source, this.$t('Total'))
    },
    loginTrendOptions() {
      const { primary, TwoLevelColor, ThreeLevelColor, shadowColor } = mixColors()
      const { warning } = getReportChartTheme()
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
            data: this.config.user_login_log_metrics.dates_metrics_date
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
            // 坐标轴线样式
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
            name: this.$t('Success'),
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
            data: this.config.user_login_log_metrics.dates_metrics_success_total
          },
          {
            name: this.$t('Failed'),
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
                      color: colorToRgba(warning, 0.3)
                    },
                    {
                      offset: 0.6,
                      color: colorToRgba(warning, 0.1)
                    },
                    {
                      offset: 0.8,
                      color: colorToRgba(warning, 0.05)
                    }
                  ],
                  false
                ),
                shadowColor: colorToRgba(warning, 0.08),
                shadowBlur: 6
              }
            },
            data: this.config.user_login_log_metrics.dates_metrics_failure_total
          }
        ]
      }
    },
    loginMethodOptions() {
      const { palette, textSecondary, border } = getReportChartTheme()
      return {
        color: palette,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
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
          }
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
          data: this.config.user_login_method_metrics.dates_metrics_date,
          axisLine: {
            lineStyle: {
              color: border
            }
          },
          axisLabel: {
            color: textSecondary,
            rotate: 30
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
        barCategoryGap: '70%',
        series: Object.keys(this.config.user_login_method_metrics.dates_metrics_total).map(
          (name) => ({
            name,
            stack: 'name',
            type: 'bar',
            barMaxWidth: 32,
            itemStyle: {
              borderRadius: 0
            },
            data: this.config.user_login_method_metrics.dates_metrics_total[name]
          })
        )
      }
    },
    VisitTimeOptions() {
      const values = Object.values(this.config.user_login_time_metrics)
      const max = Math.max(...values, 1)
      const { primary, textSecondary, border } = getReportChartTheme()
      return {
        color: [primary],
        tooltip: {
          trigger: 'item',
          appendToBody: true
        },
        radar: {
          center: ['50%', '52%'],
          radius: '68%',
          splitNumber: 4,
          axisName: {
            color: textSecondary,
            fontSize: 12
          },
          axisLine: {
            lineStyle: {
              color: border
            }
          },
          splitLine: {
            lineStyle: {
              color: border
            }
          },
          splitArea: {
            show: false
          },
          indicator: [
            { name: '00:00-06:00', max: max },
            { name: '06:00-12:00', max: max },
            { name: '12:00-18:00', max: max },
            { name: '18:00-24:00', max: max }
          ]
        },
        series: [
          {
            name: this.$t('AccessDistribution'),
            type: 'radar',
            data: [
              {
                value: values,
                name: this.$t('Visits'),
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: {
                  color: primary,
                  width: 2
                },
                itemStyle: {
                  color: primary
                },
                areaStyle: {
                  color: colorToRgba(primary, 0.12)
                }
              }
            ]
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
      const data = await this.fetchReportData('/api/v1/reports/reports/users/')
      await this.loadTableData('/api/v1/reports/reports/users/')
      this.user_stats.total = data.user_stats.total
      this.user_stats.not_enabled_mfa = data.user_stats.not_enabled_mfa
      this.user_stats.valid = data.user_stats.valid
      this.user_stats.first_login = data.user_stats.first_login
      this.user_stats.face_vector = data.user_stats.face_vector
      this.user_stats.need_update_password = data.user_stats.need_update_password
      this.config.user_login_log_metrics.dates_metrics_date =
        data.user_login_log_metrics.dates_metrics_date
      this.config.user_login_log_metrics.dates_metrics_success_total =
        data.user_login_log_metrics.dates_metrics_success_total
      this.config.user_login_log_metrics.dates_metrics_failure_total =
        data.user_login_log_metrics.dates_metrics_failure_total
      this.config.user_login_method_metrics.dates_metrics_date =
        data.user_login_method_metrics.dates_metrics_date
      this.config.user_login_method_metrics.dates_metrics_total =
        data.user_login_method_metrics.dates_metrics_total
      this.config.user_login_time_metrics = data.user_login_time_metrics

      const userBySource = data.user_by_source
      if (userBySource.length !== 0) {
        this.pie.user_by_source = userBySource
      } else {
        this.pie.user_by_source = [{ name: this.$t('Nothing'), value: 0 }]
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
