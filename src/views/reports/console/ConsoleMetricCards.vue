<template>
  <div class="metric-grid">
    <div v-for="item in metrics" :key="item.key" class="metric-card">
      <div class="metric-card__body">
        <span class="metric-card__label">{{ item.label }}</span>
        <strong class="metric-card__value">{{ item.value }}</strong>
      </div>
      <span class="metric-card__icon" :class="`metric-card__icon--${item.tone}`">
        <svg-icon v-if="item.icon" :icon-class="item.icon" />
        <i v-else :class="item.fa" />
      </span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      counter: {
        total_count_online_sessions: 0,
        total_count_online_users: 0,
        total_count_today_failed_sessions: 0,
        total_count_users: 0,
        total_count_assets: 0
      }
    }
  },
  computed: {
    metrics() {
      return [
        {
          key: 'online_sessions',
          label: this.$t('OnlineSessions'),
          value: this.counter.total_count_online_sessions,
          tone: 'primary',
          fa: 'fa fa-line-chart'
        },
        {
          key: 'online_users',
          label: this.$t('CurrentConnectionUsers'),
          value: this.counter.total_count_online_users,
          tone: 'blue',
          icon: 'users'
        },
        {
          key: 'failed_sessions',
          label: this.$t('TodayFailedConnections'),
          value: this.counter.total_count_today_failed_sessions,
          tone: 'orange',
          fa: 'fa fa-exclamation-circle'
        },
        {
          key: 'users',
          label: this.$t('UserData'),
          value: this.counter.total_count_users,
          tone: 'primary',
          icon: 'users'
        },
        {
          key: 'assets',
          label: this.$t('AssetData'),
          value: this.counter.total_count_assets,
          tone: 'blue',
          icon: 'assets'
        }
      ]
    }
  },
  mounted() {
    this.getMetrics()
  },
  methods: {
    async getMetrics() {
      const data = await this.$axios.get('/api/v1/index/', {
        params: {
          total_count_online_sessions: 1,
          total_count_online_users: 1,
          total_count_today_failed_sessions: 1,
          total_count_users: 1,
          total_count_assets: 1
        }
      })
      this.counter = {
        ...this.counter,
        ...data
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.metric-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--space-4, 16px);
}

.metric-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3, 12px);
  min-width: 0;
  min-height: 118px;
  padding: var(--space-4, 16px);
  border: 1px solid var(--color-border, var(--N200));
  border-radius: var(--radius-card, 8px);
  background: var(--surface-panel, #fff);
}

.metric-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 12px);
  min-width: 0;
}

.metric-card__label {
  overflow: hidden;
  color: var(--N700);
  font-size: var(--font-size-sm, 13px);
  font-weight: var(--font-weight-medium, 500);
  line-height: var(--line-height-sm, 20px);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-card__value {
  color: var(--N900);
  font-size: 30px;
  font-weight: var(--font-weight-semibold, 600);
  line-height: 36px;
}

.metric-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-control, 6px);
  font-size: 14px;

  .svg-icon {
    width: 14px;
    height: 14px;
  }
}

.metric-card__icon--primary {
  background: rgba(26, 179, 148, 0.1);
  color: var(--color-primary);
}

.metric-card__icon--blue {
  background: rgba(64, 158, 255, 0.1);
  color: var(--color-info);
}

.metric-card__icon--orange {
  background: rgba(245, 166, 35, 0.12);
  color: var(--color-warning);
}

@media (max-width: 1280px) {
  .metric-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .metric-grid {
    grid-template-columns: 1fr;
  }
}
</style>
