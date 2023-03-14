<template>
  <div class="card">
    <div class="card-content">
      <div class="title">
        <Title :config="config" />
      </div>
      <div class="sub">{{ config.subTitle }}</div>
      <slot class="custom">
        <div class="num">{{ config.total }}</div>
        <div class="add">
          <span class="add-num">
            {{ $tc('dashboard.WeekAdd') }}：
            <span style="font-size: 14px;" :class="{'increase': config.weekAdd > 0}">
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
    return {
    }
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
  }
  .title {
    margin-bottom: 12px;
  }
  .sub {
    font-weight: 400;
    font-size: 12px;
    line-height: 20px;
    color: #646A73;
    margin-bottom: 4px;
  }
  .num {
    font-weight: 500;
    font-size: 32px;
    line-height: 40px;
    margin-bottom: 4px;
  }
  .add {
    display: flex;
    justify-content: space-between;
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
    & >>> .echarts {
      width: 100%!important;
      height: 272px!important;
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
