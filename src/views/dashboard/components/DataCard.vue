<template>
  <div class="card">
    <div>
      <div class="title">
        <Title :config="config" />
      </div>
      <div class="sub">{{ config.subTitle }}</div>
      <div class="num">{{ config.total }}</div>
      <div class="add">
        <span class="add-num">
          本周新增：{{ config.weekAdd }}
          <svg-icon icon-class="broken-line" style="font-size: 18px;" />
        </span>
        <span class="add-icon">
          <svg-icon icon-class="users" style="font-size: 18px;" />
        </span>
      </div>
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
    padding-bottom: 16px;
    border-bottom: 1px solid #EFF0F1;
  }
  .ring {
    padding: 26px 0 10px;
    & >>> .echarts {
      width: 100%!important;
      height: 272px!important;
    }
  }
}
</style>
