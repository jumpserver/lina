<template>
  <el-row>
    <el-col :span="1">1</el-col>
    <el-col :span="20">2</el-col>
    <el-col :span="3">3</el-col>
  </el-row>
</template>

<script>
export default {
  name: 'RecordItem',
  props: {
    index: {
      type: String,
      default: () => {}
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
