<template>
  <BaseReport
    :title="$t('ConsoleDashboard')"
    :url="reportUrl"
    :nav="nav"
    :only-charts="onlyCharts"
    :charts-padding="0"
    :disable-charts-padding="true"
    name="ConsoleDashboard"
  >
    <div class="console-dashboard" :class="{ 'console-dashboard--standalone': !onlyCharts }">
      <ConsoleMetricCards />
      <div class="console-dashboard__main">
        <UserAssetActivity class="console-dashboard__activity" />
        <div class="console-dashboard__side">
          <ConsoleEntitySummary type="user" />
          <ConsoleEntitySummary type="asset" />
        </div>
      </div>
      <AssetProportionSummary :url="url" />
      <RankSummary />
    </div>
  </BaseReport>
</template>

<script>
import UserAssetActivity from './UserAssetActivity.vue'
import ConsoleMetricCards from './ConsoleMetricCards.vue'
import ConsoleEntitySummary from './ConsoleEntitySummary.vue'
import AssetProportionSummary from './AssetProportionSummary'
import RankSummary from './RankSummary'
import BaseReport from '../base/BaseReport.vue'
import { getRouteUrl } from '@/utils/vue'

export default {
  name: 'Dashboard',
  components: {
    ConsoleEntitySummary,
    ConsoleMetricCards,
    AssetProportionSummary,
    RankSummary,
    UserAssetActivity,
    BaseReport
  },
  props: {
    nav: {
      type: Boolean,
      default: true
    },
    onlyCharts: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      url: '/api/v1/index/?total_count_type_to_assets_amount=1',
      reportUrl: ''
    }
  },
  mounted() {
    this.reportUrl = getRouteUrl({ name: 'ConsoleReport', path: '/reports/dashboard/console' }, this.$router)
  }

}
</script>

<style lang="scss" scoped>
.console-dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 16px);
}

.console-dashboard--standalone {
  padding: var(--space-6, 24px);
  background: var(--N50);
}

.console-dashboard__main {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--space-4, 16px);
  align-items: stretch;
  min-height: 360px;
}

.console-dashboard__side {
  display: grid;
  grid-column: span 1;
  grid-template-rows: 1fr 1fr;
  gap: var(--space-4, 16px);
  min-height: 0;
}

.console-dashboard__activity {
  grid-column: span 4;
  min-height: 0;
}

@media (max-width: 1280px) {
  .console-dashboard__main {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .console-dashboard__activity,
  .console-dashboard__side {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .console-dashboard__main {
    grid-template-columns: 1fr;
  }
}
</style>
