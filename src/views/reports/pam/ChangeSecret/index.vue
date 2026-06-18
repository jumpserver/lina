<template>
  <BaseReport
    v-bind="$attrs"
    :nav="nav"
    :title="$t('ChangeSecretDashboard')"
    :disable-charts-padding="true"
    name="ChangeSecretDashboard"
    :url="reportUrl"
  >
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
      <el-col :span="24">
        <AccountSummary :days="days" class="account-summary" />
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <FailedAccountSummary :days="days" class="failed-account-summary" />
      </el-col>
    </el-row>
  </BaseReport>
</template>

<script>
import SwitchDate from '@/components/Dashboard/SwitchDate'
import { getRouteUrl } from '@/utils/vue'
import BaseReport from '../../base/BaseReport.vue'
import AccountSummary from './AccountSummary.vue'
import CardSummary from './CardSummary.vue'
import DataSummary from './DataSummary.vue'
import FailedAccountSummary from './FailedAccountSummary.vue'

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
    let reportUrl = '/reports/dashboard/change-secret'
    try {
      reportUrl = getRouteUrl('ChangeSecretReport', this.$router) || reportUrl
    } catch (e) {
      console.warn('Failed to resolve ChangeSecretReport route:', e)
    }
    return {
      name: 'ChangeSecretDashboard',
      days: localStorage.getItem(this.name) || '7',
      reportUrl: reportUrl
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
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  transition: all 0.3s;

  :deep() {
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

.page :deep(.page-heading) {
  display: none;
}

.account-summary {
  @extend %card-common;
  margin-top: 1rem;
  width: 100%;
}

.failed-account-summary {
  @extend %card-common;
  height: 100%;
  margin-top: 16px;

  :deep(#HomeCard) {
    width: 100%;
  }

  :deep(#HomeCard .el-card.no-border) {
    height: 100%;
    margin-bottom: unset !important;

    .ListTable .el-pagination {
      display: flex;
      width: 100%;
      flex-wrap: nowrap;
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
  :deep(.data-summary) {
    margin-left: unset !important;
  }
}
</style>
