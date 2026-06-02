<template>
  <div class="card">
    <div class="card-content">
      <div class="title">
        <Title :config="config" />
      </div>
      <div class="sub">{{ config.subTitle }}</div>
      <slot class="custom">
        <div>
          <template v-if="config.route">
            <router-link :to="config.route">
              <div class="num">{{ config.total }}</div>
            </router-link>
          </template>
          <template v-else>
            <div class="num">{{ config.total }}</div>
          </template>
        </div>
        <div class="add">
          <span class="add-num">
            {{ $tc('WeekAdd') }}：
            <span :class="{'increase': config.weekAdd > 0}" style="font-size: 14px;">
              {{ config.weekAdd }}
            </span>
          </span>
          <span class="add-icon">
            <svg-icon v-if="config.icon" :icon-class="config.icon" class="font" />
          </span>
        </div>
      </slot>
    </div>
    <div class="ring">
      <RingChart :config="config" />
    </div>
  </div>
</template>

<script>
import Title from './Title.vue'
import RingChart from './RingChart'

export default {
  components: {
    Title,
    RingChart
  },
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {}
  }
}
</script>

<style lang="scss" scoped>
.card {
  width: 100%;
  padding: var(--space-4, 16px);
  background-color: var(--surface-panel, #fff);
  border: 1px solid var(--color-border, var(--N200));
  border-radius: var(--radius-card, 8px);

  .card-content {
    padding-bottom: var(--space-4, 16px);
    border-bottom: 1px solid var(--N200);

    .title,
    .num {
      color: var(--color-text-primary);
    }

    .title {
      margin-bottom: var(--space-3, 12px);
    }

    .num {
      font-weight: var(--font-weight-medium, 500);
      font-size: 32px;
      line-height: 40px;
      margin-bottom: var(--space-1, 4px);
    }

    .sub,
    .add {
      color: var(--color-icon-primary);
    }

    .sub {
      font-weight: 400;
      font-size: var(--font-size-sm, 13px);
      line-height: var(--line-height-sm, 20px);
      margin-bottom: var(--space-1, 4px);
    }

    .add {
      display: flex;
      justify-content: space-between;
    }
  }

  .custom {
    display: flex;
    justify-content: space-between;
    font-weight: 500;
    font-size: 32px;
    padding-bottom: 18px;
  }

  .ring {
    padding: var(--space-4, 16px) 0 0;

    & :deep(.echarts) {
      width: 100% !important;
      height: 240px !important;
    }
  }

  .font {
    font-size: 18px;
  }

  .increase {
    color: var(--color-primary);
  }
}
</style>
