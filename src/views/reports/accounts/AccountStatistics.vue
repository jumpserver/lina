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

        <div class="chart-container">
          <div class="chart-container-title">
            <div class="chart-container-title-text">{{ $t('AccountCreationSourceDistribution') }}</div>
            <div class="chart">
              <echarts
                :options="SourceOptions"
                :autoresize="true"
              />
            </div>
          </div>
        </div>
        <div class="chart-container">
          <div class="chart-container-title">
            <div class="chart-container-title-text">{{ $t('AccountConnectivityStatusDistribution') }}</div>
            <div class="chart">
              <echarts
                :options="ConnectivityOptions"
                :autoresize="true"
              />
            </div>
          </div>
        </div>
        <div class="chart-container full-width">
          <div class="chart-container-title">
            <div class="chart-container-title-text">{{ $t('AccountPasswordChangeTrends') }}</div>
            <div class="chart">
              <echarts
                :options="ChangeSecretOptions"
                :autoresize="true"
              />
            </div>
          </div>
        </div>
        <div class="chart-container">
          <div class="chart-container-title">
            <div class="chart-container-title-text">{{ $t('RankByNumberOfAssetAccounts') }}</div>
            <RankTable :config="config.top10_asset_accounts" />
          </div>
        </div>
        <div class="chart-container">
          <div class="chart-container-title">
            <div class="chart-container-title-text">{{ $t('AccountAndPasswordChangeRank') }}</div>
            <RankTable :config="config.top10_version_accounts" />
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
import { mixColors } from '@/views/reports/const'
import RankTable from '@/views/reports/users/components/RankTable.vue'

export default {
  components: {
    RankTable,
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
      title: this.$t('AccountStatisticsReport'),
      name: 'AccountStatistics',
      account_stats: {
        'total': 0,
        'active': 0,
        'connected': 0,
        'su_from': 0,
        'date_change_secret': 0,
        'template_total': 0
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
      return {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
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
                fontSize: 20,
                fontWeight: 'bold'
              }
            },
            data: this.config.source_pie
          }
        ]
      }
    },
    ConnectivityOptions() {
      return {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
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
                fontSize: 20,
                fontWeight: 'bold'
              }
            },
            data: this.config.by_connectivity
          }
        ]
      }
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
          left: 'auto',
          icon: 'rect',
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
      const data = await this.$axios.get('/api/v1/reports/reports/account-statistic/?days=30')
      this.$set(this.account_stats, 'total', data.account_stats.total)
      this.$set(this.account_stats, 'active', data.account_stats.active)
      this.$set(this.account_stats, 'connected', data.account_stats.connected)
      this.$set(this.account_stats, 'su_from', data.account_stats.su_from)
      this.$set(this.account_stats, 'date_change_secret', data.account_stats.date_change_secret)
      this.$set(this.account_stats, 'template_total', data.account_stats.template_total)
      this.$set(this.change_secret_account_metrics, 'dates_metrics_date', data.change_secret_account_metrics.dates_metrics_date)
      this.$set(this.change_secret_account_metrics, 'dates_metrics_total', data.change_secret_account_metrics.dates_metrics_total)

      const accountSourcePie = data.source_pie
      if (accountSourcePie.length !== 0) {
        this.$set(this.config, 'source_pie', accountSourcePie)
      }

      const by_connectivity = data.by_connectivity.map(item => {
        return {
          name: item.label,
          value: item.total
        }
      })
      this.$set(this.config, 'by_connectivity', by_connectivity)
      this.$set(this.config.top10_asset_accounts, 'data', data.top_assets)
      this.$set(this.config.top10_version_accounts, 'data', data.top_version_accounts)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
