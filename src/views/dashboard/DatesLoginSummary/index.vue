<template>
  <div class="white-bg dashboard-header">
    <el-row>
      <el-col :span="12">
        <h2>登录汇总</h2>
      </el-col>
      <el-col :span="12">
        <el-button-group style="float: right; padding: 0">
          <el-button type="default" size="mini" :class="{ 'active': active === 'weekly'}" @click="changeDates('weekly')">Weekly</el-button>
          <el-button type="default" size="mini" :class="{ 'active': active === 'monthly'}" @click="changeDates('monthly')">Monthly</el-button>
        </el-button-group>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :md="6" :sm="24">
        <LoginTop />
      </el-col>
      <el-col :md="12" :sm="24">
        <LoginMetric style="margin-top: -30px" heigth="300px" />
      </el-col>
      <el-col :md="6" :sm="24">
        <LoginActivePin />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import LoginTop from './LoginTop'
import LoginMetric from './LoginMetric'
import LoginActivePin from './LoginActivePin'

export default {
  name: 'DatesLoginSummary',
  components: { LoginTop, LoginMetric, LoginActivePin },
  data() {
    return {
      active: 'weekly'
    }
  },
  methods: {
    changeDates(type) {
      this.active = type
    }
  }
}
</script>

<style scoped>
  .dashboard-header {
    border-top: 0;
    padding: 20px 20px 20px 20px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
    line-height: 1.1;
    color: inherit;
  }

  .el-button--mini, .el-button--mini.is-round {
    padding: 5px 10px;
  }

  .active {
    background-image: none;
    border: 1px solid #d2d2d2;
    -webkit-box-shadow: inset 0 3px 5px rgba(0,0,0,.125);
  }
</style>
