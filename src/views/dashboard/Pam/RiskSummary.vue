<template>
  <div class="card">
    <div class="title-section">
      <Title :config="config" />
    </div>

    <div class="metrics-section">
      <template v-for="item of summaryItems">
        <SummaryCard
          :key="item.title"
          :body="item.body"
          :title="item.title"
          class="metric-item"
        />
      </template>
      <!-- <el-row :gutter="20">
        <el-col v-for="item of summaryItems" :key="item.title" :md="6" :sm="12" :xs="12">
          <SummaryCard :body="item.body" :title="item.title" />
        </el-col>
      </el-row> -->
    </div>
  </div>
</template>

<script>
import Title from '../components/Title.vue'
import SummaryCard from '@/components/Cards/SummaryCard'

export default {
  components: { Title, SummaryCard },
  data() {
    return {
      config: {
        title: this.$t('RiskyAccount'),
        tip: this.$t('RealTimeData')
      },
      counter: {
        total_long_time_no_login_accounts: '.',
        total_weak_password_accounts: '.',
        total_long_time_change_password_accounts: '.',
        total_leaked_password_accounts: '.',
        total_repeated_password_accounts: '.'
      }
    }
  },
  computed: {
    summaryItems() {
      return [
        {
          title: this.$t('LeakedPassword'),
          body: {
            count: this.counter.total_leaked_password_accounts,
            disabled: true
          }
        },
        {
          title: this.$t('WeakPassword'),
          body: {
            count: this.counter.total_weak_password_accounts,
            disabled: true
          }
        },
        {
          title: this.$t('LongTimeNoLogin'),
          body: {
            route: { name: `SessionList`, params: { activeMenu: 'OnlineList' }},
            count: this.counter.total_long_time_no_login_accounts
          }
        },

        {
          title: this.$t('LongTimeNoChangeSecret'),
          body: {
            count: this.counter.total_long_time_change_password_accounts,
            disabled: true
          }
        },
        {
          title: this.$t('RepeatedPassword'),
          body: {
            count: this.counter.total_repeated_password_accounts,
            disabled: true
          }
        },
        {
          title: 'Unmanaged'
        },
        {
          title: 'Password expiration'
        },
        {
          title: 'Wrong password'
        },
        {
          title: 'No admin'
        }
      ]
    }
  },
  async mounted() {
    this.counter = await this.getResourcesCount()
  },
  methods: {
    async getResourcesCount() {
      return this.$axios.get(
        '/api/v1/accounts/pam-dashboard/',
        {
          params: {
            total_privileged_accounts: 1,
            total_ordinary_accounts: 1,
            total_unmanaged_accounts: 1,
            total_unavailable_accounts: 1,
            total_long_time_no_login_accounts: 1,
            total_weak_password_accounts: 1,
            total_long_time_change_password_accounts: 1
          }
        }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  height: 100%;
  padding: 1.25rem;
  background-color: #FFF;
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
          color: #646A73;
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
</style>
