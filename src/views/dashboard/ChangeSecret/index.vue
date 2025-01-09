<template>
  <div v-if="this.$hasPerm('accounts.view_changesecretautomation')">
    <div class="switch-date-wrapper">
      <SwitchDate class="switch-date" @change="onChange" />
    </div>

    <el-row type="flex">

      <el-col :span="16">
        <CardSummary :days="days" class="card-summary" />
      </el-col>

      <el-col :span="8">
        <DataSummary :days="days" class="data-summary" style="margin-left: 1rem" />
      </el-col>

    </el-row>
    <el-row>
      <AccountSummary :days="days" class="account-summary" />
    </el-row>
    <el-row>
      <FailedAccountSummary :days="days" class="failed-account-summary" />
    </el-row>
  </div>
</template>

<script>
import DataSummary from './DataSummary.vue'
import CardSummary from './CardSummary.vue'
import SwitchDate from '../components/SwitchDate'
import AccountSummary from './AccountSummary.vue'
import FailedAccountSummary from './FailedAccountSummary.vue'

export default {
  name: 'ChangeSecret',
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
  %card-common {
    background: #fff;
    padding: 1.25rem;
    height: 100%;
    box-shadow: 0 1px 4px rgba(0,21,41,.08);
    transition: all .3s;

    ::v-deep {
      .card-content {
        padding-bottom: unset;
        border-bottom: unset;
      }

      .ring {
        display: none;
      }

      .el-card {
        box-shadow: none;
        border: none;
      }

      .el-card__body {
        padding: 0;
      }
    }
  }

  .switch-date-wrapper {
    margin-bottom: 1.25rem;
  }

  .page ::v-deep .page-heading {
    display: none;
  }

  .account-summary {
    @extend %card-common;
    margin-top: 1rem;
  }

  .failed-account-summary {
    @extend %card-common;
    height: 100%;
    margin-top: 16px;

    ::v-deep #HomeCard .el-card.no-border {
      height: 100%;
      margin-bottom: unset !important;
    }
  }
</style>
