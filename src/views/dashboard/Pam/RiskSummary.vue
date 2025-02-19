<template>
  <div class="card">
    <div class="title-section">
      <Title :config="config" />
    </div>
    <div class="metrics-section">
      <div ref="chartRef" class="chart-container" />
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import Title from '../components/Title.vue'

export default {
  components: { Title },
  data() {
    return {
      config: {
        title: this.$t('RiskyAccount'),
        tip: this.$t('RealTimeData')
      },
      counter: {
        total_long_time_no_login_accounts: '.',
        total_new_found_accounts: '.',
        total_group_changed_accounts: '.',
        total_sudo_changed_accounts: '.',
        total_authorized_keys_changed_accounts: '.',
        total_account_deleted_accounts: '.',
        total_password_expired_accounts: '.',
        total_long_time_password_accounts: '.',
        total_weak_password_accounts: '.',
        total_leaked_password_accounts: '.',
        total_repeated_password_accounts: '.',
        total_password_error_accounts: '.',
        total_no_admin_account_accounts: '.'
      },
      chart: null
    }
  },
  computed: {
    chartOption() {
      const data = [
        {
          name: this.$t('NoLoginLongTime'),
          value: this.counter.total_long_time_no_login_accounts
        },
        {
          name: this.$t('NewAccountsFound'),
          value: this.counter.total_new_found_accounts
        },
        {
          name: this.$t('GroupChanged'),
          value: this.counter.total_group_changed_accounts
        },
        {
          name: this.$t('SudoChanged'),
          value: this.counter.total_sudo_changed_accounts
        },
        {
          name: this.$t('AuthorizedKeysChanged'),
          value: this.counter.total_authorized_keys_changed_accounts
        },
        {
          name: this.$t('AccountDeleted'),
          value: this.counter.total_account_deleted_accounts
        },
        {
          name: this.$t('PasswordExpired'),
          value: this.counter.total_password_expired_accounts
        },
        {
          name: this.$t('LongTimePassword'),
          value: this.counter.total_long_time_password_accounts
        },
        {
          name: this.$t('WeakPassword'),
          value: this.counter.total_weak_password_accounts
        },
        {
          name: this.$t('LeakedPassword'),
          value: this.counter.total_leaked_password_accounts
        },
        {
          name: this.$t('RepeatedPassword'),
          value: this.counter.total_repeated_password_accounts
        },
        {
          name: this.$t('PasswordError'),
          value: this.counter.total_password_error_accounts
        },
        {
          name: this.$t('NoAdminAccount'),
          value: this.counter.total_no_admin_account_accounts
        }
      ]

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
          data: data.map(item => item.name),
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
            data: data.map(item => item.value),
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
              color: '#2B937C',
              opacity: 0.8,
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
  beforeDestroy() {
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
          total_group_changed_accounts: 1,
          total_sudo_changed_accounts: 1,
          total_authorized_keys_changed_accounts: 1,
          total_account_deleted_accounts: 1,
          total_password_expired_accounts: 1,
          total_long_time_password_accounts: 1,
          total_weak_password_accounts: 1,
          total_leaked_password_accounts: 1,
          total_repeated_password_accounts: 1,
          total_password_error_accounts: 1,
          total_no_admin_account_accounts: 1
        }
      })
    },
    initChart() {
      this.chart = echarts.init(this.$refs.chartRef)
      this.chart.setOption(this.chartOption)
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

      ::v-deep .summary-header {
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

        ::v-deep .no-margins {
          .num {
            color: var(--color-primary);
          }
        }
      }
    }
  }
}

.chart-container {
  width: 100%;
  height: 400px;
}
</style>
