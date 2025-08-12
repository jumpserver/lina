<template>
  <div>
    <BaseReport
      :title="title"
      :nav="nav"
      :name="name"
      v-bind="$attrs"
    >
      <div class="charts-grid">
        <SwitchDate class="switch-date" @change="onChange" />
        <br>
        <div class="chart-container full-width">
          <div class="chart-container-title">
            <div class="chart-container-title-text">{{ $t('ChangePasswordOverview') }}</div>
            <SummaryCountCard
              :items="totalData"
            />
          </div>
        </div>

        <div class="chart-container">
          <div class="chart-container-title">
            <div class="chart-container-title-text">{{ $t('OperatorGeographicDistribution') }}</div>
            <div class="chart">
              <echarts
                :options="OperatorGeographicOptions"
                :autoresize="true"
              />
            </div>
          </div>
        </div>

        <div class="chart-container">
          <div class="chart-container-title">
            <div class="chart-container-title-text">{{ $t('UserModificationTrends') }}</div>
            <div class="chart">
              <echarts
                :options="UserModificationOptions"
                :autoresize="true"
              />
            </div>
          </div>
        </div>

        <div class="chart-container">
          <div class="chart-container-title">
            <div class="chart-container-title-text">{{ $t('ModifyTheTargetUserTopTank') }}</div>
            <RankTable :config="config.change_password_top10_users" />
          </div>
        </div>

        <div class="chart-container">
          <div class="chart-container-title">
            <div class="chart-container-title-text">{{ $t('TopRankOfOperateUsers') }}</div>
            <RankTable :config="config.change_password_top10_change_bys" />
          </div>
        </div>
      </div>
    </BaseReport>
  </div>
</template>

<script>
import SwitchDate from '@/components/Dashboard/SwitchDate'
import RankTable from './components/RankTable.vue'
import BaseReport from '../base/BaseReport.vue'
import SummaryCountCard from '@/components/Dashboard/SummaryCountCard.vue'
import { mixColors } from '@/views/reports/const'
import * as echarts from 'echarts'

export default {
  components: {
    SummaryCountCard,
    RankTable,
    BaseReport,
    SwitchDate
  },
  props: {
    nav: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      title: this.$t('UserChangePasswordReport'),
      name: 'ChangePassword',
      days: localStorage.getItem('reportDays') || '7',
      total_count_change_password: {
        'total': 0,
        'user_total': 0,
        'change_by_total': 0
      },
      config: {
        change_password_top10_users: {
          data: [],
          columns: [
            {
              prop: 'user',
              label: this.$t('Username')
            },
            {
              prop: 'count',
              label: this.$t('Total')
            }
          ]
        },
        change_password_top10_change_bys: {
          data: [],
          columns: [
            {
              prop: 'change_by',
              label: this.$t('Username')
            },
            {
              prop: 'count',
              label: this.$t('Total')
            }
          ]
        },
        user_change_password_metrics: {
          dates_metrics_date: [],
          dates_metrics_total: [0]
        },
        change_password_region_distribution: [{ 'name': this.$t('Nothing'), 'value': 0 }]
      }
    }
  },
  computed: {
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
          left: 'auto',
          icon: 'rect',
          // 图例标记的图形宽度
          itemWidth: 10,
          itemHeight: 10
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
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
                  [{
                    offset: 0,
                    color: primary
                  }, {
                    offset: 0.6,
                    color: TwoLevelColor
                  }, {
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
    },

    OperatorGeographicOptions() {
      return {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          top: '5%',
          left: 'center'
        },
        series: [
          {
            name: '修改者城市分布',
            type: 'pie',
            radius: ['40%', '70%'],
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 40,
                fontWeight: 'bold'
              }
            },
            data: this.config.change_password_region_distribution
          }
        ]
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
      const data = await this.$axios.get(`/api/v1/reports/reports/user-change-password/?days=${this.days}`)
      this.$set(this.total_count_change_password, 'total', data.total_count_change_password.total)
      this.$set(this.total_count_change_password, 'user_total', data.total_count_change_password.user_total)
      this.$set(this.total_count_change_password, 'change_by_total', data.total_count_change_password.change_by_total)
      this.$set(this.config.change_password_top10_users, 'data', data.change_password_top10_users)
      this.$set(this.config.change_password_top10_change_bys, 'data', data.change_password_top10_change_bys)
      this.$set(this.config.user_change_password_metrics, 'dates_metrics_date', data.user_change_password_metrics.dates_metrics_date)
      this.$set(this.config.user_change_password_metrics, 'dates_metrics_total', data.user_change_password_metrics.dates_metrics_total)

      const changePasswordRegionDistribution = data.change_password_region_distribution
      if (changePasswordRegionDistribution.length !== 0) {
        this.$set(this.config, 'change_password_region_distribution', changePasswordRegionDistribution)
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
