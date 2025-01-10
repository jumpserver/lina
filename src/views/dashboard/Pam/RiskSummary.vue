<template>
  <div class="box">
    <div style="margin-bottom: 12px;">
      <Title :config="config" />
    </div>
    <div class="content">
      <el-row justify="space-between" type="flex">
        <el-col v-for="item of summaryItems" :key="item.title" :md="8" :sm="12" :xs="12">
          <SummaryCard :body="item.body" :title="item.title" />
        </el-col>
      </el-row>
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
          title: this.$t('LongTimeNoLogin'),
          body: {
            route: { name: `SessionList`, params: { activeMenu: 'OnlineList' }},
            count: this.counter.total_long_time_no_login_accounts
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
          title: this.$t('LongTimeNoChangeSecret'),
          body: {
            count: this.counter.total_long_time_change_password_accounts,
            disabled: true
          }
        },
        {
          title: this.$t('LeakedPassword'),
          body: {
            count: this.counter.total_leaked_password_accounts,
            disabled: true
          }
        },
        {
          title: this.$t('RepeatedPassword'),
          body: {
            count: this.counter.total_repeated_password_accounts,
            disabled: true
          }
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
.box {
  padding: 20px;
  background: #FFFFFF;

  .content {
    .el-col {
      padding-left: 16px;
      border-left: 1px solid #EFF0F1;

      &:first-child {
        padding-left: 0;
        border-left: none;
      }
    }

    .sub {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 20px;
      color: #646A73;
    }

    .num {
      font-style: normal;
      font-weight: 500;
      font-size: 24px;
      cursor: pointer;
    }
  }
}
</style>
