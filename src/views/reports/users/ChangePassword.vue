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
            data-report-name="UserModificationTrends"
          >
            <div class="chart-container-title">
              <div class="chart-container-title-text">{{ $t('UserModificationTrends') }}</div>
              <div class="chart">
                <Echart :options="UserModificationOptions" :autoresize="true" />
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
import { mixColors } from '@/views/reports/const'
import * as echarts from 'echarts'
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
      title: this.$t('UserChangePasswordReport'),
      name: 'UserChangePasswordReport',
      charts: [
        { name: 'Overview', title: this.$t('Overview') },
        { name: 'UserModificationTrends', title: this.$t('UserModificationTrends') }
      ],
      tables: [
        { name: 'Overview', title: this.$t('Overview') },
        { name: 'UserModificationTrends', title: this.$t('UserModificationTrends') },
        { name: 'ModifyTheTargetUserTopTank', title: this.$t('ModifyTheTargetUserTopTank') },
        { name: 'TopRankOfOperateUsers', title: this.$t('TopRankOfOperateUsers') }
      ],
      days: localStorage.getItem(this.name) || '7',
      total_count_change_password: {
        total: 0,
        user_total: 0,
        change_by_total: 0
      },
      config: {
        user_change_password_metrics: {
          dates_metrics_date: [],
          dates_metrics_total: [0]
        }
      }
    }
  },
  computed: {
    rankingTableConfigs() {
      return {
        [this.$t('ModifyTheTargetUserTopTank')]: this.config.change_password_top10_users,
        [this.$t('TopRankOfOperateUsers')]: this.config.change_password_top10_change_bys
      }
    },
    totalData() {
      return [
        {
          title: this.$t('Total'),
          body: {
            route: { name: `PasswordChangeLog` },
            count: this.total_count_change_password.total
          }
        },
        {
          title: this.$t('TargetUser'),
          body: {
            count: this.total_count_change_password.user_total
          }
        },
        {
          title: this.$t('Operator'),
          body: {
            count: this.total_count_change_password.change_by_total
          }
        }
      ]
    },
    UserModificationOptions() {
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
          // 图例标记的图形宽度
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
            data: this.config.user_change_password_metrics.dates_metrics_date
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
            name: this.primaryName,
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
            data: this.config.user_change_password_metrics.dates_metrics_total
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
      const data = await this.fetchReportData('/api/v1/reports/reports/user-change-password/')
      await this.loadTableData('/api/v1/reports/reports/user-change-password/')
      this.total_count_change_password.total = data.total_count_change_password.total
      this.total_count_change_password.user_total = data.total_count_change_password.user_total
      this.total_count_change_password.change_by_total =
        data.total_count_change_password.change_by_total
      this.config.user_change_password_metrics.dates_metrics_date =
        data.user_change_password_metrics.dates_metrics_date
      this.config.user_change_password_metrics.dates_metrics_total =
        data.user_change_password_metrics.dates_metrics_total
    }
  }
}
</script>

<style lang="scss" scoped></style>
