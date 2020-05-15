<template>
  <Page>
    <el-row :gutter="20">
      <el-col :span="6"><div class="grid-content bg-purple" /></el-col>
      <el-col :span="6"><div class="grid-content bg-purple" /></el-col>
      <el-col :span="6"><div class="grid-content bg-purple" /></el-col>
      <el-col :span="6"><div class="grid-content bg-purple" /></el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="4"><div class="grid-content bg-purple" /></el-col>
      <el-col :span="16"><div class="grid-content bg-purple" /></el-col>
      <el-col :span="4"><div class="grid-content bg-purple" /></el-col>
    </el-row>
    <el-row type="flex" class="row-bg" justify="space-between">
      <el-col :span="6"><div class="grid-content bg-purple" /></el-col>
      <el-col :span="6"><div class="grid-content bg-purple-light" /></el-col>
      <el-col :span="6"><div class="grid-content bg-purple" /></el-col>
    </el-row>
  </Page>
</template>

<script>
import { Page } from '@/layout/components'

export default {
  name: 'Dashboard',
  components: {
    Page
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  .el-row {
    margin-bottom: 20px;
    min-height: 10px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .el-col {
    border-radius: 4px;
    background-color: #000;
  }
  .bg-purple {
    background: #000;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
  .bg-purple-light {
    background: #000;
  }
  .row-bg {
    padding: 10px 0;
    background-color: #000;
  }
}
</style>
