<template>
  <div class="box">
    <div style="margin-bottom: 12px;">
      <Title :config="config" />
    </div>
    <div class="content">
      <el-row justify="space-between" type="flex">
        <el-col v-for="item of summaryItems" :key="item.title" :md="8" :sm="12" :xs="12">
          <SummaryCard :title="item.title" v-bind="item.body" />
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
            route: { name: `SessionList`, params: { activeMenu: 'OnlineList' }},
            count: this.counter.total_privileged_accounts,
            disabled: !this.$hasPerm('terminal.view_session')
          }
        },
        {
          title: this.$t('GeneralAccounts'),
          body: {
            route: { name: `SessionList`, params: { activeMenu: 'OnlineList' }},
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
