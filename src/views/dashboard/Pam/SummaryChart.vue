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
              <div class="num"> {{ config.total }} </div>
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
    <div class="ring" />
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
    return {}
  }
}
</script>

<style lang="scss" scoped>
.card {
  width: 100%;
  padding: 20px;
  background-color: #FFF;

  .card-content {
    padding-bottom: 16px;
    border-bottom: 1px solid #EFF0F1;

    .title,
    .num {
      color: var(--color-text-primary);
    }

    .title {
      margin-bottom: 12px;
    }

    .num {
      font-weight: 500;
      font-size: 32px;
      line-height: 40px;
      margin-bottom: 4px;
    }

    .sub,
    .add {
      color: var(--color-icon-primary);
    }

    .sub {
      font-weight: 400;
      font-size: 12px;
      line-height: 20px;
      margin-bottom: 4px;
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
    padding: 26px 0 10px;

    & ::v-deep .echarts {
      width: 100% !important;
      height: 278px !important;
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
