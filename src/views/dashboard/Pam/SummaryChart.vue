<template>
  <div class="card">
    <div class="title-section">
      <Title :config="config" />
    </div>

    <div class="total-section">
      <div class="total-account"> {{ config.total }} </div>

      <div class="week-add">
        <div class="week-add-title"> {{ $t('WeekAdd') }} </div>
        <div class="week-add-value"> + {{ config.weekAdd }} </div>
      </div>
    </div>

    <el-divider />

    <div class="metrics-section">
      <div
        v-for="item in summaryItems"
        :key="item.key"
        class="metric-item"
      >
        <span class="metric-label">{{ $tc(item.label) }}</span>
        <span class="metric-value" :class="{'increase': config[item.key] > 0}">
          {{ config[item.key] }}
        </span>
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
          label: this.$t('Privileged'),
          key: 'privileged'
        },
        {
          label: this.$t('ResetSecret'),
          key: 'resetSecret'
        },
        {
          label: this.$t('Connectable'),
          key: 'connectable'
        },
        {
          label: this.$t('Valid'),
          key: 'valid'
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
$text-color: #646A73;

.el-divider--horizontal {
  margin: unset !important;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  height: 100%;
  padding: 1.25rem;
  background-color: #FFF;
  overflow: hidden;
  border-radius: 0.25rem;

  .total-section {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;

    .sub-title {
      color: #646A73;
      font-size: 0.9rem;
      font-weight: 400;
    }

    .total-account {
      color: #1F2329;
      font-size: 2rem;
      font-weight: 500;
      line-height: 2.5rem;
    }

    .week-add {
      display: flex;
      gap: 0.5rem;
      color: #1F2329;
      font-weight: 400;
      line-height: 1.4rem;

      .week-add-title {
        font-size: 0.9rem;
        font-weight: inherit;
        line-height: inherit;
      }

      .week-add-value {
        color: #F54A45;
        font-size: 0.9rem;
        font-weight: inherit;
        line-height: inherit;
      }
    }
  }

  .metrics-section {
    display: flex;
    width: 100%;

    .metric-item {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      flex: 1;
      transition: all 0.3s ease-in-out;

      .metric-label {
        color: #646A73;
        font-weight: 400;
        line-height: 1.4rem;
        font-size: 0.9rem;
      }

      .metric-value {
        color: #1F2329;
        line-height: 2rem;
        font-size: 1.5rem;
        font-weight: 500;
      }

      &:hover {
        cursor: pointer;
        transform: translateY(-0.2rem);

        .metric-value {
          color: #1ab394;
        }
      }
    }
  }
}
</style>
