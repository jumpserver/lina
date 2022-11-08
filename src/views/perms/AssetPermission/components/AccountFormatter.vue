<template>
  <el-checkbox-group v-model="select">
    <el-checkbox label="所有账号" value="@ALL" />
    <el-checkbox label="手动输入" value="@INPUT" />
    <el-checkbox label="同名账号" value="@USER" />
    <el-checkbox label="指定输入" value="INPUT" />
  </el-checkbox-group>
</template>

<script>
export default {
  props: {
    value: {
      type: [Array, String],
      default: () => []
    }
  },
  data() {
    return {
      select: '',
      input3: ''
    }
  }

}
</script>

<style scoped>
.select >>> .el-input.el-input--suffix {
  width: 100px
}

</style>
