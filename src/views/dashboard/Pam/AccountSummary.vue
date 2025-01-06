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
        title: this.$t('账号汇总'),
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
          title: this.$t('特权账号'),
          body: {
            route: { name: `SessionList`, params: { activeMenu: 'OnlineList' }},
            count: this.counter.total_privileged_accounts,
            disabled: !this.$hasPerm('terminal.view_session')
          }
        },
        {
          title: this.$t('普通账号'),
          body: {
            route: { name: `SessionList`, params: { activeMenu: 'OnlineList' }},
            count: this.counter.total_ordinary_accounts
          }
        },
        {
          title: this.$t('未托管账号'),
          body: {
            count: this.counter.total_unmanaged_accounts,
            disabled: true
          }
        },
        {
          title: this.$t('不可用账号'),
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
