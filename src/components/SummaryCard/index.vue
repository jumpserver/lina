<template>
  <el-card>
    <div slot="header">
      <span>卡片名称</span>
      <span class="pull-right">卡片标签</span>
    </div>
    <div>
      <span>卡片内容</span>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'SummaryCard',
  props: {
  }
}
</script>

<style scoped>
  .pull-right {
    float: right!important;
  }
</style>
