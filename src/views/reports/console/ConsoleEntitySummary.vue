<template>
  <div class="entity-card">
    <div class="entity-card__header">
      <Title :config="titleConfig" />
      <svg-icon :icon-class="icon" class="entity-card__header-icon" />
    </div>
    <div class="entity-card__content">
      <div class="entity-card__meta">
        <span>{{ totalLabel }}</span>
        <strong>{{ total }}</strong>
        <small>{{ $tc('WeekAdd') }}：{{ weekAdd }}</small>
      </div>
      <div class="entity-card__visual">
        <span class="entity-card__visual-label">{{ activeLabel }}</span>
        <div class="entity-card__donut" :style="donutStyle">
          <div class="entity-card__donut-core">
            <strong>{{ active }}</strong>
            <small>{{ percentText }}%</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Title from '@/components/Dashboard/Title.vue'

export default {
  components: {
    Title
  },
  props: {
    type: {
      type: String,
      default: 'user'
    }
  },
  data() {
    return {
      total: 0,
      active: 0,
      weekAdd: 0
    }
  },
  computed: {
    isUser() {
      return this.type === 'user'
    },
    titleConfig() {
      return {
        title: this.isUser ? this.$t('UserData') : this.$t('AssetData'),
        tip: this.isUser ? this.$t('UserData') : this.$t('AssetData')
      }
    },
    icon() {
      return this.isUser ? 'users' : 'assets'
    },
    totalLabel() {
      return this.isUser ? this.$t('UsersTotal') : this.$t('AssetsTotal')
    },
    activeLabel() {
      return this.isUser ? this.$t('LoginUserToday') : this.$t('LoginAssetToday')
    },
    percent() {
      if (!this.total) {
        return 0
      }
      return Math.min((Number(this.active || 0) / Number(this.total)) * 100, 100)
    },
    percentText() {
      return this.percent.toFixed(2)
    },
    donutStyle() {
      const color = this.isUser ? '#F5A623' : '#1AB394'
      return {
        background: `conic-gradient(${color} 0 ${this.percent}%, var(--N100) ${this.percent}% 100%)`
      }
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    async getData() {
      const params = this.isUser
        ? {
          total_count_users: 1,
          total_count_users_this_week: 1,
          total_count_login_users: 1
        }
        : {
          total_count_assets: 1,
          total_count_assets_this_week: 1,
          total_count_today_active_assets: 1
        }
      const data = await this.$axios.get('/api/v1/index/', { params })
      if (this.isUser) {
        this.total = data.total_count_users || 0
        this.active = data.total_count_login_users || 0
        this.weekAdd = data.total_count_users_this_week || 0
      } else {
        this.total = data.total_count_assets || 0
        this.active = data.total_count_today_active_assets || 0
        this.weekAdd = data.total_count_assets_this_week || 0
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.entity-card {
  display: flex;
  flex-direction: column;
  min-height: 172px;
  padding: var(--space-3, 12px);
  border: 1px solid var(--color-border, var(--N200));
  border-radius: var(--radius-card, 8px);
  background: var(--surface-panel, #fff);
}

.entity-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3, 12px);
  margin-bottom: var(--space-2, 8px);
}

.entity-card__header-icon {
  width: 16px;
  height: 16px;
  color: var(--N500);
}

.entity-card__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 92px;
  gap: var(--space-2, 8px);
  align-items: start;
  flex: 1;
  min-height: 0;
}

.entity-card__meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-1, 4px);
  min-width: 0;

  span,
  small {
    color: var(--N600);
    font-size: var(--font-size-xs, 12px);
    line-height: var(--line-height-xs, 18px);
  }

  strong {
    color: var(--N900);
    font-size: 26px;
    font-weight: var(--font-weight-semibold, 600);
    line-height: 34px;
  }
}

.entity-card__visual {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  gap: var(--space-2, 8px);
  min-width: 0;
}

.entity-card__visual-label {
  min-height: var(--line-height-xs, 18px);
  max-width: 92px;
  overflow: hidden;
  color: var(--N600);
  font-size: var(--font-size-xs, 12px);
  line-height: var(--line-height-xs, 18px);
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entity-card__donut {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  border-radius: 50%;
}

.entity-card__donut-core {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 68px;
  height: 68px;
  padding: var(--space-1, 4px);
  border-radius: 50%;
  background: var(--surface-panel, #fff);
  text-align: center;

  small {
    color: var(--N600);
    font-size: 10px;
    line-height: 14px;
    white-space: nowrap;
  }

  strong {
    color: var(--N900);
    font-size: 20px;
    font-weight: var(--font-weight-semibold, 600);
    line-height: 24px;
  }
}
</style>
