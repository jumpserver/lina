<template>
  <div class="box">
    <div style="margin-bottom: 12px;">
      <span class="title">实时数据</span>
      <span class="time">更新时间：2022-11-17</span>
    </div>
    <div class="content">
      <el-row type="flex" justify="space-between">
        <el-col v-for="item of summaryItems" :key="item.title" :md="8" :sm="12" :xs="12">
          <SummaryCard :title="item.title" :body="item.body" />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import SummaryCard from './SummaryCard'

export default {
  components: { SummaryCard },
  props: {

  },
  data() {
    return {
      counter: {
        total_count_assets: '.',
        total_count_users: '.',
        total_count_online_users: '.',
        total_count_online_sessions: '.'
      }
    }
  },
  computed: {
    summaryItems() {
      return [
        {
          title: this.$t('dashboard.AssetsTotal'),
          body: {
            route: { name: 'AssetList' },
            count: this.counter.total_count_assets,
            disabled: !this.$hasPerm('assets.view_asset')
          }
        },
        {
          title: this.$t('dashboard.ConnectUsers'),
          body: {
            route: { name: `SessionList`, params: { activeMenu: 'OnlineList' }},
            count: this.counter.total_count_online_users,
            disabled: !this.$hasPerm('terminal.view_session')
          }
        },
        {
          title: this.$t('dashboard.OnlineSessions'),
          body: {
            route: { name: `SessionList`, params: { activeMenu: 'OnlineList' }},
            count: this.counter.total_count_online_sessions,
            disabled: !this.$hasPerm('terminal.view_session')
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
      return this.$axios.get('/api/v1/index/?total_count=1')
    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  padding: 20px;
  background: #FFFFFF;
  .title {
    font-weight: 500;
    font-size: 16px;
    color: #1F2329;
  }
  .time {
    font-style: normal;
    font-weight: 400;
    font-size: 10px;
    margin-left: 8px;
    color: #8F959E;
  }
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
