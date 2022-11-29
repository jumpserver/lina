<template>
  <Page>
    <div v-if="this.$hasPerm('rbac.view_console|rbac.view_audit')">
      <Announcement />
      <el-row :gutter="16">
        <el-col :lg="12" :sm="24">
          <RealTimeSummary />
          <LineChart />
        </el-col>
        <el-col :lg="12" :sm="24">
          <DataSummary />
        </el-col>
      </el-row>
      <AssetProportionSummary />
      <RankSummary />
    </div>
    <Page403 v-else />
  </Page>
</template>

<script>
import { Announcement } from '@/components'
import { Page } from '@/layout/components'
import Page403 from '@/views/403'
import DataSummary from './DataSummary'
import AssetProportionSummary from './AssetProportionSummary'
import RankSummary from './RankSummary'
import RealTimeSummary from './components/RealTimeSummary.vue'
import LineChart from './components/LineChart.vue'

export default {
  name: 'Dashboard',
  components: {
    Page,
    Announcement,
    DataSummary,
    AssetProportionSummary,
    RankSummary,
    RealTimeSummary,
    LineChart,
    Page403
  },
  data() {
    return {
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
