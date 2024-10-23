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
        title: this.$t('风险账号'),
        tip: this.$t('RealTimeData')
      },
      counter: {
        total_count_online_sessions: '.',
        total_count_online_users: '.',
        total_count_today_failed_sessions: '.'
      }
    }
  },
  computed: {
    summaryItems() {
      return [
        {
          title: this.$t('幽灵账号'),
          body: {
            route: { name: `SessionList`, params: { activeMenu: 'OnlineList' }},
            count: 23,
            disabled: !this.$hasPerm('terminal.view_session')
          }
        },
        {
          title: this.$t('僵尸账号'),
          body: {
            route: { name: `SessionList`, params: { activeMenu: 'OnlineList' }},
            count: 293,
            disabled: !this.$hasPerm('terminal.view_session')
          }
        },
        {
          title: this.$t('弱密码'),
          body: {
            count: 203,
            disabled: true
          }
        },
        {
          title: this.$t('长时未改密'),
          body: {
            count: 1010,
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
        '/api/v1/index/',
        {
          params: {
            total_count_online_sessions: 1,
            total_count_online_users: 1,
            total_count_today_failed_sessions: 1
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
