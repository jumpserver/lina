<template>
  <Page>
    <div v-if="$hasPerm('rbac.view_console')">
      <Announcement />

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
          <el-col :span="14" :xs="24">
            <AccountSecretSummary class="account-secret-summary" />
          </el-col>
          <el-col :span="10" :xs="24">
            <RiskSummary class="risk-summary" />
          </el-col>
        </el-row>

        <el-row>
          <AssetProportionSummary :url="url" class="asset-proportion-summary" />
        </el-row>
      </div>
    </div>
    <Page403 v-else />
  </Page>
</template>

<script>
import { Page } from '@/layout/components'
import { Announcement } from '@/components'
import Page403 from '@/views/403'
import DataSummary from './DataSummary'
import RiskSummary from './RiskSummary.vue'
import AssetProportionSummary from './AssetProportionSummary'
import MissionSummery from './MissionSummery.vue'
import AccountSecretSummary from '@/views/accounts/AccountChangeSecret/Overview/AccountSummary.vue'

export default {
  name: 'Dashboard',
  components: {
    Page,
    Page403,
    DataSummary,
    RiskSummary,
    Announcement,
    MissionSummery,
    AccountSecretSummary,
    AssetProportionSummary
  },
  data() {
    return {
      url: '/api/v1/accounts/pam-dashboard/?total_count_type_to_accounts=1'
    }
  }
}
</script>

<style lang="scss" scoped>
.el-row {
  margin-bottom: 1.25rem;
}

.summary-container {
  .account-secret-summary,
  .asset-proportion-summary,
  .risk-summary,
  .mission-summery {
    border-radius: 0.25rem;
  }

  .account-secret-summary,
  .asset-proportion-summary {
    margin-top: unset;
  }

  .account-secret-summary {
    margin-top: unset;

    ::v-deep .echarts {
      height: 16rem;
    }
  }
}

@media (max-width: 768px) {
  .data-summery {
    margin-bottom: 1.25rem;
  }

  .risk-summary {
    margin-top: 1.25rem;
  }
}
</style>
