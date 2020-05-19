<template>
  <Page>
    <el-row :gutter="20">
      <el-col :span="6"><SummaryCard /></el-col>
      <el-col :span="6"><SummaryCard /></el-col>
      <el-col :span="6"><SummaryCard /></el-col>
      <el-col :span="6"><SummaryCard /></el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="4"><SummaryCard /></el-col>
      <el-col :span="16"><SummaryCard /></el-col>
      <el-col :span="4"><SummaryCard /></el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="8"><SummaryCard /></el-col>
      <el-col :span="8"><SummaryCard /></el-col>
      <el-col :span="8"><SummaryCard /></el-col>
    </el-row>
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import { SummaryCard } from '@/components'

export default {
  name: 'Dashboard',
  components: {
    Page, SummaryCard
  }
}
</script>

<style lang="scss" scoped>
  .el-row {
    margin-bottom: 25px;
    &:last-child {
      margin-bottom: 0;
    }
  }

</style>
