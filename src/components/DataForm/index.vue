<template>
  <elFormRender ref="dataForm" :content="content" v-bind="$attrs" v-on="$listeners">
    <el-form-item v-if="defaultButton">
      <el-button size="small" type="primary" @click="submitForm('dataForm')">submit</el-button>
      <el-button size="small" @click="resetForm('dataForm')">reset</el-button>
    </el-form-item>
    <slot name="Actions" />
  </elFormRender>
</template>

<script>
import elFormRender from './components/el-form-renderer'
export default {
  components: {
    elFormRender
  },
  props: {
    defaultButton: {
      type: Boolean,
      default: true
    },
    content: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$message('submit!')
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.el-form /deep/ .el-form-item {
    margin-bottom: 12px;
}

</style>
