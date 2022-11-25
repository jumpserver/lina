<template>
  <Page>
    <div v-if="this.$hasPerm('rbac.view_console|rbac.view_audit')">
      <Announcement />
      <el-row :gutter="16">
        <el-col :lg="12" :sm="24">
          <LeftSummary />
        </el-col>
        <el-col :lg="12" :sm="24">
          <DataSummary />
        </el-col>
      </el-row>
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
import LeftSummary from './LeftSummary'
import RankSummary from './RankSummary'

export default {
  name: 'Dashboard',
  components: {
    Page,
    Announcement,
    DataSummary,
    LeftSummary,
    RankSummary,
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
