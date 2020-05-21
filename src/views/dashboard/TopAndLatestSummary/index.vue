<template>
  <el-row :gutter="20" style="margin: 20px 0">
    <el-col :md="8" :sm="12">
      <TopAssets />
    </el-col>
    <el-col :md="8" :sm="12">
      <TimelineCard class="card-item" />
    </el-col>
    <el-col :md="8" :sm="12">
      <TopUser />
    </el-col>
  </el-row>
</template>

<script>
import TimelineCard from '@/components/TimelineCard'
import TopAssets from './TopAssets'
import TopUser from './TopUser'

export default {
  name: 'TopAndLatestSummary',
  components: { TimelineCard, TopAssets, TopUser },
  data() {
    return {}
  }
}
</script>

<style scoped>

</style>
