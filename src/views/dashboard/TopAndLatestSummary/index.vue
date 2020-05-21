<template>
  <el-row :gutter="10" style="margin-bottom: 20px;margin-top: 20px">
    <el-col :md="8" :sm="12">
      <TopUser />
    </el-col>
    <el-col :md="8" :sm="12">
      <TopAssets />
    </el-col>
    <el-col :md="8" :sm="12">
      <Latest10Sessions class="card-item" />
    </el-col>
  </el-row>
</template>

<script>
// import TimelineCard from '@/components/TimelineCard'
import TopAssets from './TopAssets'
import TopUser from './TopUser'
import Latest10Sessions from './Latest10Sessions'

export default {
  name: 'TopAndLatestSummary',
  components: { TopAssets, TopUser, Latest10Sessions },
  data() {
    return {}
  }
}
</script>

<style scoped>

</style>
