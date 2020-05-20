<template>
  <Page>
    <ResourceSummary />
    <DatesLoginSummary />
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :md="8" :sm="12">
        <TimeLineCard class="card-item" />
      </el-col>
      <el-col :md="8" :sm="12" />
      <el-col :md="8" :sm="12" />
    </el-row>
  </Page>
</template>

<script>
import { Page } from '@/layout/components'
import TimeLineCard from '@/components/TimeLineCard'
import ResourceSummary from './ResourceSummary'
import DatesLoginSummary from './DatesLoginSummary'

export default {
  name: 'Dashboard',
  components: {
    Page, DatesLoginSummary, ResourceSummary, TimeLineCard
  },
  data() {
    return {
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
