<template>
  <div class="white-bg dashboard-header print-margin">
    <el-row>
      <el-col :md="12" :sm="24">
        <h2>{{ $t('dashboard.LoginOverview') }}</h2>
      </el-col>
      <el-col :md="12" :sm="24" class="clearfix">
        <el-button-group style="float: right; padding: 0" class="clearfix">
          <el-button type="default" size="mini" :class="{ 'active': active === 'weekly'}" @click="changeDates('weekly')">{{ $t('dashboard.Weekly') }}</el-button>
          <el-button type="default" size="mini" :class="{ 'active': active === 'monthly'}" @click="changeDates('monthly')">{{ $t('dashboard.Monthly') }}</el-button>
        </el-button-group>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :lg="18" :sm="24">
        <LoginMetric :range="active" class="card-item" heigth="300px" />
      </el-col>
      <el-col :lg="6" :sm="24">
        <LoginActivePin :range="active" class="card-item" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import LoginMetric from './LoginMetric'
import LoginActivePin from './LoginActivePin'

export default {
  name: 'DatesLoginSummary',
  components: { LoginMetric, LoginActivePin },
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
  @media print {
    .disabled-when-print{
      display: none;
    }
    .enabled-when-print{
      display: inherit !important;
    }
    .print-margin{
      margin-top: 20px;
    }
  }

</style>
