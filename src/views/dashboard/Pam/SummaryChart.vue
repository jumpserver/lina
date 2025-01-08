<template>
  <div class="card">
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
          <div class="metric-content">
            <span class="metric-label">{{ $tc(item.label) }}</span>
            <span class="metric-value" :class="{'increase': config[item.key] > 0}">
              {{ config[item.key] }}
            </span>
          </div>
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
.card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  height: 100%;
  background-color: #FFF;
  overflow: hidden;

  .title-section {
    flex-shrink: 0;
    .title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    gap: 1.5rem;

    .info-box {
      display: flex;
      flex: 3;
      justify-content: center;
      flex-direction: column;
      gap: 0.375rem;

      .total-number {
        font-size: 2rem;
        font-weight: 700;
        color: var(--color-text-primary);
        line-height: 1.2;

        a {
          color: inherit;
          text-decoration: none;
          &:hover { color: var(--color-primary); }
        }
      }

      .sub-title {
        font-size: 0.875rem;
        color: var(--color-icon-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .metrics-section {
      flex: 1;
      min-height: 0;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      align-content: flex-end;

      .metric-item {
        min-width: 0;
        padding: 0.5rem 0;
        transition: all 0.2s ease;
        cursor: pointer;

        &:hover {
          background-color: var(--color-neutral-muted);
          transform: translateY(-2px);
        }

        .metric-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;

          .metric-label {
            font-size: 0.75rem;
            color: var(--color-icon-primary);
            text-transform: uppercase;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .metric-value {
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--color-text-primary);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            &.increase {
              color: var(--color-primary);
            }
          }
        }
      }
    }
  }

  @media (max-width: 768px) {
    .content {
      gap: 1.25rem;

      .metrics-section {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  }

  @media (max-width: 480px) {
    .content {
      .metrics-section {
        grid-template-columns: repeat(2, 1fr);

        .metric-item {
          padding: 0.375rem 0.5rem;

          &:hover {
            transform: translateY(-1px);
          }

          .metric-content {
            .metric-value {
              font-size: 1rem;
            }
          }
        }
      }
    }
  }
}
</style>
