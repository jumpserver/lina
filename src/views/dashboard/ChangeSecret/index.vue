<template>
  <div v-if="this.$hasPerm('accounts.view_changesecretautomation')">
    <div>
      <SwitchDate class="switch-date" @change="onChange" />
    </div>

    <el-row type="flex">

      <el-col :span="18">
        <CardSummary :days="days" class="card-summary" />
      </el-col>

      <el-col :span="6">
        <DataSummary :days="days" class="data-summary" style="margin-left: 1rem" />
      </el-col>

    </el-row>

    <el-row :gutter="24" type="flex">

      <el-col :span="14">
        <FailedAccountSummary :days="days" class="failed-account-summary" />
      </el-col>

      <el-col :span="10">
        <AccountSummary :days="days" class="account-summary" />
      </el-col>

    </el-row>
  </div>
</template>

<script>
import SwitchDate from '../components/SwitchDate'
import FailedAccountSummary from './FailedAccountSummary.vue'
import DataSummary from './DataSummary.vue'
import CardSummary from './CardSummary.vue'
import AccountSummary from './AccountSummary.vue'

export default {
  components: {
    AccountSummary,
    SwitchDate,
    DataSummary,
    FailedAccountSummary,
    CardSummary
  },
  data() {
    return {
      days: localStorage.getItem('dashboardDays') || '7'
    }
  },
  methods: {
    onChange(val) {
      this.days = val
      localStorage.setItem('dashboardDays', val)
    }
  }
}
</script>

<style lang="scss" scoped>

  .page ::v-deep .page-heading {
    display: none;
  }

  .failed-account-summary {
    height: 100%;
    margin-top: 16px;

   ::v-deep #HomeCard .el-card.no-border {
     height: 100%;
     margin-bottom: unset !important;
    }
  }

</style>
