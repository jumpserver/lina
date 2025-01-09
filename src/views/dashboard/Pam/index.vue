<template>
  <Page>
    <div v-if="this.$hasPerm('rbac.view_console')">
      <Announcement />

      <div class="dashboard-container">
        <el-row :gutter="20" class="top-summary">
          <el-col :lg="16" :xs="24" class="left-column">
            <div class="account-wrapper">
              <AccountSummary class="summary-card" />
            </div>
            <div class="risk-wrapper">
              <RiskSummary class="summary-card" />
            </div>
          </el-col>
          <el-col :lg="8" :xs="24" class="right-column">
            <DataSummary class="summary-card" />
          </el-col>
        </el-row>

        <el-row :gutter="20" class="middle-section">
          <el-col :span="24">
            <AccountSecretSummary class="secret-summary" />
          </el-col>
        </el-row>

        <el-row :gutter="20" class="bottom-section">
          <el-col :span="24" class="asset-proportion-wrapper">
            <AssetProportionSummary :url="url" class="summary-card" />
          </el-col>
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
import AccountSummary from './AccountSummary.vue'
import AssetProportionSummary from './AssetProportionSummary'
import AccountSecretSummary from '../ChangeSecret/AccountSummary.vue'

export default {
  name: 'Dashboard',
  components: {
    Page,
    Announcement,
    DataSummary,
    AssetProportionSummary,
    RiskSummary,
    AccountSummary,
    AccountSecretSummary,
    Page403
  },
  data() {
    return {
      url: '/api/v1/accounts/pam-dashboard/?total_count_type_to_accounts_amount=1'
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 1.25rem;

  .top-summary,
  .middle-section,
  .bottom-section {
    margin-bottom: 1.25rem;
  }

  .top-summary {
    .left-column {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .right-column {
      max-height: 286px;
      height: 286px;

      ::v-deep .el-row,
      ::v-deep .el-col {
        height: 100%;
      }
    }
  }

  .bottom-section {
    .data-summary-wrapper {
      margin-bottom: 1.25rem;
    }
  }

  .summary-card {
    background: #fff;
    padding: 1.25rem;
    height: 100%;
    box-shadow: 0 1px 4px rgba(0,21,41,.08);
    transition: all .3s;

    ::v-deep .card-content {
      padding-bottom: unset;
      border-bottom: unset;
    }

    ::v-deep .ring {
      display: none;
    }
  }

  .secret-summary {
    background: #fff;
    padding: 1.25rem;
    margin-bottom: 1.25rem;
    box-shadow: 0 1px 4px rgba(0,21,41,.08);
  }

  @media screen and (max-width: 1200px) {
    .right-column {
      margin-top: 1.25rem;
    }
  }

  @media screen and (max-width: 768px) {
    padding: 0.625rem;

    .el-col {
      margin-bottom: 1.25rem;
    }
  }
}
</style>
