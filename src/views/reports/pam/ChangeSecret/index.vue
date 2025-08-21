<template>
  <BaseReport :only-charts="!nav">
    <div class="switch-date-wrapper">
      <SwitchDate class="switch-date" :name="name" @change="onChange" />
    </div>

    <el-row>
      <el-col :lg="16" :md="24">
        <CardSummary :days="days" class="card-summary" />
      </el-col>

      <el-col :lg="8" :md="24">
        <DataSummary :days="days" class="data-summary" />
      </el-col>

    </el-row>
    <el-row>
      <AccountSummary :days="days" class="account-summary" />
    </el-row>
    <el-row>
      <FailedAccountSummary :days="days" class="failed-account-summary" />
    </el-row>
  </BaseReport>
</template>

<script>
import DataSummary from './DataSummary.vue'
import CardSummary from './CardSummary.vue'
import SwitchDate from '@/components/Dashboard/SwitchDate'
import AccountSummary from './AccountSummary.vue'
import FailedAccountSummary from './FailedAccountSummary.vue'
import BaseReport from '../../base/BaseReport.vue'

export default {
  name: 'ChangeSecret',
  components: {
    AccountSummary,
    SwitchDate,
    DataSummary,
    FailedAccountSummary,
    CardSummary,
    BaseReport
  },
  props: {
    nav: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      name: 'ChangeSecretDashboard',
      days: localStorage.getItem(this.name) || '7'
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

  .change-secret-container {
    min-width: 670px;
  }

  // .switch-date-wrapper {
  //   margin-bottom: 1.25rem;
  // }

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

      .ListTable .el-pagination {
        display: block;
      }
    }
  }

  .data-summary {
    margin-left: 1rem;
  }

  .account-summary,
  .data-summary,
  .card-summary,
  .failed-account-summary {
    min-width: unset;
  }

  @media (max-width: 1200px) {
    ::v-deep .data-summary {
      margin-left: unset !important;
    }
  }
</style>
