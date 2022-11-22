<template>
  <Page>
    <div v-if="this.$hasPerm('rbac.view_console|rbac.view_audit')">
      <Announcement />
      <!-- <ResourceSummary /> -->
      <!-- <DatesLoginSummary /> -->
      <el-row :gutter="16">
        <el-col :lg="12" :sm="24">
          <Left />
        </el-col>
        <el-col :lg="12" :sm="24">
          <DataSummary />
        </el-col>
      </el-row>
      <TrendSummary />
      <TopAndLatestSummary />
    </div>
    <Page403 v-else />
  </Page>
</template>

<script>
import { Announcement } from '@/components'
import { Page } from '@/layout/components'
import TopAndLatestSummary from './TopAndLatestSummary'
import Page403 from '@/views/403'
import DataSummary from './DataSummary'
import Left from './Left'
import TrendSummary from './TrendSummary'

export default {
  name: 'Dashboard',
  components: {
    Page,
    TopAndLatestSummary,
    Announcement,
    DataSummary,
    Left,
    TrendSummary,
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
