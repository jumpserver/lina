<template>
  <div class="box">
    <div class="head">
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
import Title from './Title.vue'
import SummaryCard from '@/components/Cards/SummaryCard'

export default {
  components: { Title, SummaryCard },
  data() {
    return {
      config: {
        title: this.$t('RealTimeData'),
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
          title: this.$t('OnlineSessions'),
          body: {
            route: { name: `SessionList`, params: { activeMenu: 'OnlineList' } },
            count: this.counter.total_count_online_sessions,
            disabled: !this.$hasPerm('terminal.view_session')
          }
        },
        {
          title: this.$t('CurrentConnectionUsers'),
          body: {
            route: { name: `SessionList`, params: { activeMenu: 'OnlineList' } },
            count: this.counter.total_count_online_users,
            disabled: !this.$hasPerm('terminal.view_session')
          }
        },
        {
          title: this.$t('TodayFailedConnections'),
          body: {
            count: this.counter.total_count_today_failed_sessions,
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
  padding: var(--space-4, 16px);
  background: var(--surface-panel, #fff);
  border: 1px solid var(--color-border, var(--N200));
  border-radius: var(--radius-card, 8px);

  .head {
    margin-bottom: var(--space-3, 12px);
  }

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
      font-size: var(--font-size-xs, 12px);
      line-height: var(--line-height-xs, 18px);
      color: var(--N600);
    }

    .num {
      font-style: normal;
      font-weight: 500;
      font-size: 20px;
      line-height: 28px;
      cursor: pointer;
    }
  }
}
</style>
