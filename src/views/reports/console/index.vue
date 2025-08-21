<template>
  <BaseReport
    :title="$t('ConsoleDashboard')"
    :url="reportUrl"
    :nav="nav"
    :only-charts="onlyCharts"
    name="ConsoleDashboard"
  >
    <el-row :gutter="16">
      <el-col :lg="12" :sm="24">
        <RealTimeSummary />
        <UserAssetActivity />
      </el-col>
      <el-col :lg="12" :sm="24">
        <DataSummary />
      </el-col>
    </el-row>
    <AssetProportionSummary :url="url" />
    <RankSummary />
  </BaseReport>
</template>

<script>
import RealTimeSummary from '@/components/Dashboard/RealTimeSummary.vue'
import UserAssetActivity from './UserAssetActivity.vue'
import DataSummary from './DataSummary'
import AssetProportionSummary from './AssetProportionSummary'
import RankSummary from './RankSummary'
import BaseReport from '../base/BaseReport.vue'
import { getRouteUrl } from '@/utils/vue'

export default {
  name: 'Dashboard',
  components: {
    DataSummary,
    AssetProportionSummary,
    RankSummary,
    RealTimeSummary,
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
    this.reportUrl = getRouteUrl('ConsoleReport', this.$router)
  }

}
</script>

<style lang="scss" scoped>
</style>
