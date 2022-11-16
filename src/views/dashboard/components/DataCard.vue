<template>
  <div class="card">
    <div>
      <div class="title">标题</div>
      <div class="sub">二标题11111</div>
      <div class="num">1231231213</div>
      <div class="add">
        <span class="add-num">
          本周新增：0
          <i class="fa fa-line-chart" />
        </span>
        <span class="add-icon">
          <i class="fa fa-users" />
        </span>
      </div>
    </div>
    <div class="ring">
      <RingChart />
    </div>
  </div>
</template>

<script>
import RingChart from './RingChart'
export default {
  components: {
    RingChart
  },
  props: {

  },
  data() {
    return {

    }
  },
  created() {

  },
  methods: {

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
    line-height: 26px;
    font-weight: 500;
    font-size: 16px;
    color: #1F2329;
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
    padding: 26px 43px 10px;
    & >>> .echarts {
      width: 100%!important;
      height: 272px!important;
    }
  }
}
</style>
