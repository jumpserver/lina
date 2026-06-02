<template>
  <BaseReport
    v-bind="$attrs"
    :nav="nav"
    :url="reportUrl"
    :title="$t('PamDashboard')"
    :disable-charts-padding="true"
    name="PamDashboard"
  >
    <div class="summary-container">
      <el-row :gutter="20">
        <el-col :span="14" :xs="24">
          <DataSummary class="data-summery" />
        </el-col>
        <el-col :span="10" :xs="24">
          <MissionSummery class="mission-summery" />
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col v-if="$store.getters.hasValidLicense && $hasPerm('accounts.view_changesecretautomation')" :span="14" :xs="24">
          <AccountSecretSummary class="account-secret-summary" />
        </el-col>
        <el-col :span="$store.getters.hasValidLicense && $hasPerm('accounts.view_changesecretautomation') ? 10: 24" :xs="24">
          <RiskSummary class="risk-summary" />
        </el-col>
      </el-row>

      <el-row>
        <AssetProportionSummary :url="url" class="asset-proportion-summary" />
      </el-row>
    </div>
  </BaseReport>
</template>

<script>
import { getRouteUrl } from '@/utils/vue'
import AccountSecretSummary from '@/views/reports/pam/ChangeSecret/AccountSummary.vue'
import BaseReport from '../../base/BaseReport.vue'
import AssetProportionSummary from './AssetProportionSummary.vue'
import DataSummary from './DataSummary.vue'
import MissionSummery from './MissionSummery.vue'
import RiskSummary from './RiskSummary.vue'

export default {
  name: 'Dashboard',
  components: {
    DataSummary,
    RiskSummary,
    MissionSummery,
    AccountSecretSummary,
    AssetProportionSummary,
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
      url: '/api/v1/accounts/pam-dashboard/?total_count_type_to_accounts=1',
      reportUrl: getRouteUrl({ name: 'PamReport', path: '/reports/dashboard/pam' }, this.$router)
    }
  }
}
</script>

<style lang="scss" scoped>
.el-row {
  margin-bottom: var(--space-6, 24px);
}

.summary-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-6, 24px);

  .el-row {
    margin-bottom: 0;
  }

  .account-secret-summary,
  .asset-proportion-summary,
  .risk-summary,
  .mission-summery {
    border-radius: var(--radius-card, 8px);
  }

  .account-secret-summary,
  .asset-proportion-summary {
    margin-top: unset;
  }

  .account-secret-summary {
    margin-top: unset;

    :deep(.echarts) {
      height: 16rem;
    }
  }
}

@media (max-width: 768px) {
  .data-summery {
    margin-bottom: var(--space-4, 16px);
  }

  .risk-summary {
    margin-top: var(--space-4, 16px);
  }
}
</style>
