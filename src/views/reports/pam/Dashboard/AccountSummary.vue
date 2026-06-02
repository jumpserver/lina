<template>
  <div class="box">
    <div style="margin-bottom: 12px;">
      <Title :config="config" />
    </div>
    <div class="content">
      <el-row justify="space-between" type="flex">
        <el-col v-for="item of summaryItems" :key="item.title" :md="8" :sm="12" :xs="12">
          <SummaryCard v-bind="item.body" :title="item.title" />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import Title from '@/components/Dashboard/Title.vue'
import SummaryCard from '@/components/Cards/SummaryCard'

export default {
  components: { Title, SummaryCard },
  data() {
    return {
      config: {
        title: this.$t('AccountSummary'),
        tip: this.$t('RealTimeData')
      },
      counter: {
        total_privileged_accounts: '',
        total_ordinary_accounts: '',
        total_unmanaged_accounts: '',
        total_unavailable_accounts: ''
      }
    }
  },
  computed: {
    summaryItems() {
      return [
        {
          title: this.$t('Privileged'),
          body: {
            route: { name: `SessionList`, params: { activeMenu: 'OnlineList' } },
            count: this.counter.total_privileged_accounts,
            disabled: !this.$hasPerm('terminal.view_session')
          }
        },
        {
          title: this.$t('GeneralAccounts'),
          body: {
            route: { name: `SessionList`, params: { activeMenu: 'OnlineList' } },
            count: this.counter.total_ordinary_accounts
          }
        },
        {
          title: this.$t('UnmanagedAccount'),
          body: {
            count: this.counter.total_unmanaged_accounts,
            disabled: true
          }
        },
        {
          title: this.$t('UnavailableAccount'),
          body: {
            count: this.counter.total_unavailable_accounts,
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
            total_unavailable_accounts: 1
          }
        }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  padding: var(--space-4, 16px);
  background: var(--surface-panel, #fff);
  border: 1px solid var(--color-border, var(--N200));
  border-radius: var(--radius-card, 8px);

  .content {
    .el-col {
      padding-left: var(--space-4, 16px);
      border-left: 1px solid var(--N200);

      &:first-child {
        padding-left: 0;
        border-left: none;
      }
    }

    .sub {
      font-style: normal;
      font-weight: 400;
      font-size: var(--font-size-sm, 13px);
      line-height: var(--line-height-sm, 20px);
      color: var(--N600);
    }

    .num {
      font-style: normal;
      font-weight: 500;
      font-size: 24px;
      line-height: 32px;
      cursor: pointer;
    }
  }
}
</style>
