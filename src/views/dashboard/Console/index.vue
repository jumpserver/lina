<template>
  <Page>
    <div v-if="this.$hasPerm('rbac.view_console')">
      <Announcement />
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
    </div>
    <Page403 v-else />
  </Page>
</template>

<script>
import { Announcement } from '@/components'
import { Page } from '@/layout/components'
import Page403 from '@/views/403'
import RealTimeSummary from '@/components/Dashboard/RealTimeSummary.vue'
import UserAssetActivity from './UserAssetActivity.vue'
import DataSummary from './DataSummary'
import AssetProportionSummary from './AssetProportionSummary'
import RankSummary from './RankSummary'

export default {
  name: 'Dashboard',
  components: {
    Page,
    Announcement,
    DataSummary,
    AssetProportionSummary,
    RankSummary,
    RealTimeSummary,
    UserAssetActivity,
    Page403
  },
  data() {
    return {
      url: '/api/v1/index/?total_count_type_to_assets_amount=1'
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
