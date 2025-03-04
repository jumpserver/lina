<template>
  <div class="card">
    <div class="card-content">
      <div class="left-section">
        <div class="title-section">
          <Title :config="config" />
        </div>

        <div class="total-section">
          <div class="total-title">{{ $t('TotalAccounts') }}</div>
          <div class="total-account"> {{ config.total }} </div>
          <div class="week-add">
            <div class="week-add-title"> {{ $t('WeekAdd') }} </div>
            <div class="week-add-value"> + {{ config.weekAdd }} </div>
          </div>
        </div>
      </div>

      <div ref="chartRef" class="right-section" />
    </div>

    <el-divider />

    <div class="metrics-section">
      <div
        v-for="item in summaryItems"
        :key="item.key"
        class="metric-item"
        @click="handleClick(item)"
      >
        <span class="metric-label">{{ $tc(item.label) }}</span>
        <span class="metric-value" :class="{'increase': config[item.key] > 0}">
          {{ config[item.key] }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import Title from '@/components/Dashboard/Title.vue'

export default {
  components: {
    Title
  },
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      summaryItems: [
        {
          label: this.$t('Privileged'),
          key: 'privileged'
        },
        {
          label: this.$t('ResetSecret'),
          key: 'resetSecret'
        },
        {
          label: this.$t('Connectable'),
          key: 'connectable'
        },
        {
          label: this.$t('Active'),
          key: 'valid'
        }
      ]
    }
  },
  computed: {
    chartOption() {
      return {
        title: {
          show: false
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          show: false
        },
        grid: {
          left: '3%',
          right: '3%',
          bottom: 0
        },
        xAxis: [
          {
            show: false,
            type: 'category',
            boundaryGap: false,
            data: [this.$t('Privileged'), this.$t('ResetSecret'), this.$t('Connectable'), this.$t('Active')]
          }
        ],
        yAxis: [
          {
            show: false,
            type: 'value'
          }
        ],
        series: [
          {
            type: 'line',
            stack: 'Total',
            smooth: true,
            itemStyle: {
              color: '#1AB394'
            },
            lineStyle: {
              width: 2,
              color: '#1AB394'
            },
            showSymbol: false,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(26, 179, 148, 0.3)'
                },
                {
                  offset: 1,
                  color: 'rgba(26, 179, 148, 0)'
                }
              ])
            },
            emphasis: {
              focus: 'series'
            },
            data: []
          }
        ]
      }
    }
  },
  watch: {
    config: {
      handler(newData) {
        if (this.chart) {
          this.chart.setOption({
            series: [{
              data: [newData.privileged, newData.resetSecret, newData.valid, newData.connectable]
            }]
          })
        }
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    this.initChart()
    window.addEventListener('resize', this.resizeChart)
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
    window.removeEventListener('resize', this.resizeChart)
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.chartRef)
      this.chart.setOption(this.chartOption)
    },
    resizeChart() {
      if (this.chart) {
        this.chart.resize()
      }
    },
    handleClick(item) {
      this.$router.push({ name: this.config.route.name, query: { payload: item.key }})
    }
  }
}
</script>

<style lang="scss" scoped>
$text-color: #646A73;

.el-divider--horizontal {
  margin: unset !important;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 1.37rem;
  width: 100%;
  height: 100%;
  padding: 1.25rem;
  background-color: #FFF;
  overflow: hidden;
  border-radius: 0.25rem;

  .card-content {
    display: flex;

    .left-section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;

      .total-section {
        display: flex;
        gap: 0.4rem;
        flex-direction: column;
        margin-top: 0.5rem;

        .total-title {
          font-size: 0.875rem;
          color: #646A73;
          font-weight: 400;
        }

        .sub-title {
          color: #646A73;
          font-size: 0.9rem;
          font-weight: 400;
        }

        .total-account {
          color: #1F2329;
          font-size: 2rem;
          font-weight: 500;
          line-height: 2.5rem;
        }

        .week-add {
          display: flex;
          gap: 0.5rem;
          color: #1F2329;
          font-weight: 400;
          line-height: 1.4rem;

          .week-add-title {
            font-size: 0.9rem;
            font-weight: inherit;
            line-height: inherit;
          }

          .week-add-value {
            color: #F54A45;
            font-size: 0.9rem;
            font-weight: inherit;
            line-height: inherit;
          }
        }
      }
    }

    .right-section {
      height: 8rem;
      width: 20rem;
    }
  }

  .metrics-section {
    display: flex;
    width: 100%;

    .metric-item {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      flex: 1;
      transition: all 0.3s ease-in-out;

      .metric-label {
        color: #646A73;
        font-weight: 400;
        line-height: 1.4rem;
        font-size: 0.9rem;
      }

      .metric-value {
        color: #1F2329;
        line-height: 2rem;
        font-size: 1.5rem;
        font-weight: 500;
      }

      &:hover {
        cursor: pointer;
        transform: translateY(-0.2rem);

        .metric-value {
          color: #1ab394;
        }
      }
    }
  }
}
</style>
