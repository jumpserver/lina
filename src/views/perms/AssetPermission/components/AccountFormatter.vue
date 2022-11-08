<template>
  <el-input v-model="input3" placeholder="请输入内容" class="input-with-select">
    <el-select slot="prepend" v-model="select" class="select" placeholder="选择特殊账号">
      <el-option label="所有账号" value="@ALL" />
      <el-option label="手动输入" value="@INPUT" />
      <el-option label="动态账号" value="@USER" />
    </el-select>
  </el-input>
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
