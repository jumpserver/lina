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
            <div class="chart-container-title-text">{{ $t('AssetTypeDistribution') }}</div>
            <div class="chart">
              <echarts
                :options="AssetTypeOptions"
                :autoresize="true"
              />
            </div>
          </div>
        </div>
        <div class="chart-container full-width">
          <div class="chart-container-title">
            <div class="chart-container-title-text">{{ $t('WeeklyGrowthTrend') }}</div>
            <div class="chart">
              <echarts
                :options="AddedAssetOptions"
                :autoresize="true"
              />
            </div>
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

export default {
  components: {
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
      title: this.$t('AssetStatisticsReport'),
      name: 'AssetStatistics',
      asset_stats: {
        'total': 0,
        'active': 0,
        'connected': 0,
        'zone': 0,
        'directory_services': 0,
        'platform_count': 0
      },
      assets_by_type_category: {
        'categories': [],
        'typeLabelMap': new Map(),
        'series': []
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
      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params) => {
            const currentCategoryIndex = params[0].dataIndex
            const filtered = params.filter(p => p.data > 0)
            let result = `${this.assets_by_type_category.categories[currentCategoryIndex]}<br/>`
            filtered.forEach(p => {
              result += `${p.marker}${p.seriesName}: ${p.value}<br/>`
            })
            return result
          }
        },
        legend: {
          data: Array.from(this.assets_by_type_category.typeLabelMap.values())
        },
        xAxis: {
          type: 'category',
          data: this.assets_by_type_category.categories
        },
        yAxis: {
          type: 'value'
        },
        series: this.assets_by_type_category.series,
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
      const data = await this.$axios.get('/api/v1/reports/reports/asset-statistic/?days=7')
      this.$set(this.asset_stats, 'total', data.asset_stats.total)
      this.$set(this.asset_stats, 'active', data.asset_stats.active)
      this.$set(this.asset_stats, 'connected', data.asset_stats.connected)
      this.$set(this.asset_stats, 'zone', data.asset_stats.zone)
      this.$set(this.asset_stats, 'directory_services', data.asset_stats.directory_services)
      this.$set(this.asset_stats, 'platform_count', data.asset_stats.platform_count)
      this.$set(this.added_asset_metrics, 'dates_metrics_date', data.added_asset_metrics.dates_metrics_date)
      this.$set(this.added_asset_metrics, 'dates_metrics_total', data.added_asset_metrics.dates_metrics_total)

      const assetsByTypeCategory = data.assets_by_type_category || {}

      const categories = Object.keys(assetsByTypeCategory)

      const typeLabelMap = new Map()
      const typeSet = new Set()

      categories.forEach(cat => {
        assetsByTypeCategory[cat].forEach(item => {
          typeSet.add(item.type)
          typeLabelMap.set(item.type, item.label)
        })
      })

      const types = Array.from(typeSet)

      const series = types.map(type => {
        const data = categories.map(cat => {
          const found = assetsByTypeCategory[cat].find(item => item.type === type)
          return found ? found.total : 0
        })

        return {
          name: typeLabelMap.get(type),
          type: 'bar',
          stack: this.$t('Total'),
          data
        }
      })
      this.$set(this.assets_by_type_category, 'categories', categories)
      this.$set(this.assets_by_type_category, 'typeLabelMap', typeLabelMap)
      this.$set(this.assets_by_type_category, 'series', series)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
