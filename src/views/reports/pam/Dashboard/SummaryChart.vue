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

      <Echart class="right-section" :options="chartOption" />
    </div>

    <el-divider />

    <div class="metrics-section">
      <div
        v-for="item in summaryItems"
        :key="item.key"
        class="metric-item"
        @click="!item.disabled && handleClick(item)"
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
import Echart from '@/components/Dashboard/Echart.vue'
import Title from '@/components/Dashboard/Title.vue'

export default {
  components: {
    Echart,
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
          key: 'privileged',
          disabled: !this.$hasPerm('accounts.view_account')
        },
        {
          label: this.$t('ResetSecret'),
          key: 'resetSecret',
          disabled: !this.$hasPerm('accounts.view_account')
        },
        {
          label: this.$t('Connectable'),
          key: 'connectable',
          disabled: !this.$hasPerm('accounts.view_account')
        },
        {
          label: this.$t('Active'),
          key: 'is_active',
          disabled: !this.$hasPerm('accounts.view_account')
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
            data: [this.config.privileged, this.config.resetSecret, this.config.connectable, this.config.is_active]
          }
        ]
      }
    }
  },
  methods: {
    handleClick(item) {
      this.$router.push({ name: this.config.route.name, query: { payload: item.key } })
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
  gap: var(--space-4, 16px);
  width: 100%;
  height: 100%;
  padding: var(--space-4, 16px);
  background-color: var(--surface-panel, #fff);
  overflow: hidden;
  border: 1px solid var(--color-border, var(--N200));
  border-radius: var(--radius-card, 8px);

  .card-content {
    display: flex;
    gap: var(--space-4, 16px);

    .left-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-2, 8px);
      flex: 1;

      .total-section {
        display: flex;
        gap: var(--space-2, 8px);
        flex-direction: column;
        margin-top: var(--space-2, 8px);

        .total-title {
          font-size: var(--font-size-sm, 13px);
          color: var(--N600);
          font-weight: 400;
        }

        .sub-title {
          color: var(--N600);
          font-size: var(--font-size-sm, 13px);
          font-weight: 400;
        }

        .total-account {
          color: var(--N900);
          font-size: 32px;
          font-weight: var(--font-weight-medium, 500);
          line-height: 40px;
        }

        .week-add {
          display: flex;
          gap: var(--space-2, 8px);
          color: var(--N900);
          font-weight: 400;
          line-height: var(--line-height-sm, 20px);

          .week-add-title {
            font-size: var(--font-size-sm, 13px);
            font-weight: inherit;
            line-height: inherit;
          }

          .week-add-value {
            color: #F54A45;
            font-size: var(--font-size-sm, 13px);
            font-weight: inherit;
            line-height: inherit;
          }
        }
      }
    }

    .right-section {
      height: 128px;
      width: 320px;
    }
  }

  .metrics-section {
    display: flex;
    width: 100%;

    .metric-item {
      display: flex;
      flex-direction: column;
      gap: var(--space-1, 4px);
      flex: 1;
      transition: color var(--duration-fast) var(--ease-standard);

      .metric-label {
        color: var(--N600);
        font-weight: 400;
        line-height: var(--line-height-sm, 20px);
        font-size: var(--font-size-sm, 13px);
      }

      .metric-value {
        color: var(--N900);
        line-height: 32px;
        font-size: 24px;
        font-weight: var(--font-weight-medium, 500);
      }

      &:hover {
        cursor: pointer;

        .metric-value {
          color: var(--color-primary);
        }
      }
    }
  }
}
</style>
