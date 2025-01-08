<template>
  <div class="summary-card">
    <div class="title-section">
      <Title :config="config" />
    </div>

    <div class="content">
      <div class="info-box">
        <div class="total-number">
          <template v-if="config.route">
            <router-link :to="config.route">{{ config.total }}</router-link>
          </template>
          <template v-else>{{ config.total }}</template>
        </div>
        <div class="sub-title">{{ config.subTitle }}</div>
      </div>

      <div class="metrics-section">
        <div
          v-for="item in summaryItems"
          :key="item.key"
          class="metric-item"
        >
          <span class="metric-value" :class="{'increase': config[item.key] > 0}">
            {{ config[item.key] }}
          </span>
          <span class="metric-label">{{ $tc(item.label) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Title from '../components/Title.vue'

export default {
  components: {
    Title
  },
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      summaryItems: [
        {
          key: 'weekAdd',
          label: 'WeekAdd',
          className: 'add'
        },
        {
          key: 'connectivityOk',
          label: 'ConnectivityOk',
          className: 'connection'
        },
        {
          key: 'secretReset',
          label: 'SecretReset',
          className: 'connection'
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.summary-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  background-color: #FFF;

  .title-section {
    .title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text-primary);
      letter-spacing: -0.01em;
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 2rem;

    .info-box {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
      min-width: 160px;
      padding: 1rem 0;

      .total-number {
        font-size: 2.25rem;
        font-weight: 700;
        color: var(--color-text-primary);
        line-height: 1;
        letter-spacing: -0.02em;

        a {
          color: inherit;
          text-decoration: none;
          transition: color 0.2s ease;
          &:hover { color: var(--color-primary); }
        }
      }

      .sub-title {
        font-size: 0.875rem;
        color: var(--color-icon-primary);
        font-weight: 500;
      }
    }

    .metrics-section {
      display: flex;
      justify-content: space-between;
      flex-wrap: nowrap;
      gap: 0.75rem;

      .metric-item {
        min-width: 120px;
        padding: 0.75rem 0;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        transition: all 0.2s ease;

        &:hover {
          transform: translateY(-2px);
        }

        .metric-value {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-text-primary);
          letter-spacing: -0.01em;

          &.increase {
            color: var(--color-primary);
          }
        }

        .metric-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--color-icon-primary);
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
      }
    }
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
    gap: 1.25rem;

    .content {
      gap: 1rem;

      .info-box {
        width: 100%;
        padding: 0.875rem 0;

        .total-number {
          font-size: 2rem;
        }
      }

      .metrics-section {
        width: 100%;
        justify-content: space-between;

        .metric-item {
          flex: 1;
          min-width: calc(33.333% - 0.5rem);
          max-width: calc(50% - 0.5rem);
        }
      }
    }
  }

  @media (max-width: 480px) {
    padding: 1rem;

    .metrics-section .metric-item {
      min-width: calc(50% - 0.375rem);
    }
  }
}
</style>
