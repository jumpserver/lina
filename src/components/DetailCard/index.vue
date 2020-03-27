<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>{{ title }}</span>
    </div>
    <div class="content">
      <el-row v-for="item in items" :key="'card-' + item.key" class="item" :gutter="10">
        <el-col :span="6"><div class="item-label"><label>{{ item.key }}</label></div></el-col>
        <el-col :span="18"><div class="item-text">{{ item.value }}</div></el-col>
      </el-row>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'DetailCard',
  props: {
    title: {
      type: String,
      default: ''
    },
    items: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
  .content {
    font-size: 13px;
    line-height: 2;
  }
</style>
