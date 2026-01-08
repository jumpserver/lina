<template>
  <div class="card">
    <div v-if="isTitle" class="title-section">
      <Title :config="config" />
    </div>
    <div class="metrics-section">
      <div ref="chartRef" class="the-chart" />
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import Title from '@/components/Dashboard/Title.vue'

export default {
  components: { Title },
  props: {
    isTitle: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      config: {
        title: this.$t('RiskyAccount'),
        tip: this.$t('RealTimeData')
      },
      counter: {
        total_long_time_no_login_accounts: '.',
        total_new_found_accounts: '.',
        total_groups_changed_accounts: '.',
        total_sudoers_changed_accounts: '.',
        total_authorized_keys_changed_accounts: '.',
        total_account_deleted_accounts: '.',
        total_password_expired_accounts: '.',
        total_long_time_password_accounts: '.',
        total_weak_password_accounts: '.',
        total_leaked_password_accounts: '.',
        total_repeated_password_accounts: '.'
      },
      chart: null
    }
  },
  computed: {
    chartOption() {
      const data = [
        {
          description: 'long_time_no_login',
          name: this.$t('NoLoginLongTime'),
          value: this.counter.total_long_time_no_login_accounts
        },
        {
          description: 'new_found',
          name: this.$t('NewAccountsFound'),
          value: this.counter.total_new_found_accounts
        },
        {
          description: 'groups_changed',
          name: this.$t('GroupsChanged'),
          value: this.counter.total_groups_changed_accounts
        },
        {
          description: 'sudoers_changed',
          name: this.$t('SudoersChanged'),
          value: this.counter.total_sudoers_changed_accounts
        },
        {
          description: 'authorized_keys_changed',
          name: this.$t('AuthorizedKeysChanged'),
          value: this.counter.total_authorized_keys_changed_accounts
        },
        {
          description: 'account_deleted',
          name: this.$t('AccountDeleted'),
          value: this.counter.total_account_deleted_accounts
        },
        {
          description: 'password_expired',
          name: this.$t('PasswordExpired'),
          value: this.counter.total_password_expired_accounts
        },
        {
          description: 'long_time_password',
          name: this.$t('LongTimePassword'),
          value: this.counter.total_long_time_password_accounts
        },
        {
          description: 'weak_password',
          name: this.$t('WeakPassword'),
          value: this.counter.total_weak_password_accounts
        },
        {
          description: 'leaked_password',
          name: this.$t('LeakedPassword'),
          value: this.counter.total_leaked_password_accounts
        },
        {
          description: 'repeated_password',
          name: this.$t('RepeatedPassword'),
          value: this.counter.total_repeated_password_accounts
        }
      ]

      let filteredData = []

      // 只要有一个大于零 则展示全部的
      if (data.some(item => item.value > 0)) {
        filteredData = data
      } else {
        filteredData = data.slice(0, 7)
      }

      // 找出所有数据中最大的值，并设置为 x 轴的 max。如果全是零则设置为 10
      const maxValue = Math.max(...filteredData.map(item => item.value))
      const max = maxValue > 0 ? maxValue : 10

      return {
        grid: {
          top: '5%',
          left: '0',
          right: '15%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          show: true,
          min: 0,
          max: max,
          position: 'top',
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#E5E6EB'
            }
          },
          axisLabel: {
            color: '#646A73',
            fontSize: 12
          }
        },
        yAxis: {
          type: 'category',
          data: filteredData.map(item => item.name),
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: '#646A73',
            fontSize: 12,
            margin: 20,
            width: 90,
            overflow: 'truncate',
            lineHeight: 12,
            fontWeight: 400
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        series: [
          {
            type: 'bar',
            data: filteredData.map(item => ({
              name: item.name,
              value: item.value,
              description: item.description
            })),
            barWidth: '60%',
            label: {
              show: false,
              valueAnimation: true,
              formatter: '{c}',
              fontSize: 12,
              color: '#1F2329',
              distance: 10
            },
            itemStyle: {
              color: '#1AB394',
              borderRadius: [0, 4, 4, 0]
            }
          }
        ]
      }
    }
  },
  watch: {
    counter: {
      handler() {
        this.updateChart()
      },
      deep: true
    }
  },
  async mounted() {
    this.counter = await this.getResourcesCount()
    this.initChart()
    window.addEventListener('resize', this.resizeChart)
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
    window.removeEventListener('resize', this.resizeChart)
  },
  methods: {
    async getResourcesCount() {
      return this.$axios.get('/api/v1/accounts/pam-dashboard/', {
        params: {
          total_long_time_no_login_accounts: 1,
          total_new_found_accounts: 1,
          total_groups_changed_accounts: 1,
          total_sudoers_changed_accounts: 1,
          total_authorized_keys_changed_accounts: 1,
          total_account_deleted_accounts: 1,
          total_password_expired_accounts: 1,
          total_long_time_password_accounts: 1,
          total_weak_password_accounts: 1,
          total_leaked_password_accounts: 1,
          total_repeated_password_accounts: 1
        }
      })
    },
    initChart() {
      this.chart = echarts.init(this.$refs.chartRef)
      this.chart.setOption(this.chartOption)

      if (this.$hasPerm('accounts.view_accountrisk')) {
        this.chart.on('click', (params) => {
          if (params.componentType === 'series') {
            this.$router.push({
              name: 'AccountCheckList',
              query: {
                payload: params.data.description
              }
            })
          }
        })
      }
    },
    updateChart() {
      if (this.chart) {
        this.chart.setOption(this.chartOption)
      }
    },
    resizeChart() {
      if (this.chart) {
        this.chart.resize()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  height: 100%;
  padding: 1.25rem;
  background-color: #fff;
  overflow: hidden;

  .metrics-section {
    display: flex;
    flex-wrap: wrap;
    row-gap: 1.25rem;

    .metric-item {
      width: 25%;
      cursor: pointer;
      transition: all 0.3s ease-in-out;

      :deep(.summary-header) {
        .title {
          color: #646a73;
          font-size: 0.9rem;
          font-weight: 400;
          line-height: 1.4rem;
          text-transform: unset;
        }

        h3 span {
          font-size: 1.5rem;
        }
      }

      &:hover {
        transform: translateY(-0.2rem);

        :deep(.no-margins) {
          .num {
            color: var(--color-primary);
          }
        }
      }
    }
  }
}

.the-chart {
  width: 100%;
  height: 16rem;
}
</style>
