<template>
  <elFormRender ref="dataForm" :content="content" v-bind="$attrs" v-on="$listeners">
    <!-- slot 透传 -->
    <slot v-for="item in content" :slot="`id:${item.id}`" :name="`id:${item.id}`" />
    <slot v-for="item in content" :slot="`$id:${item.id}`" :name="`$id:${item.id}`" />

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
          this.$emit('submit')
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    getBasic() {
      if (this.url) {
        console.log('has Url')
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-form /deep/ .el-form-item {
    margin-bottom: 12px;

    margin-left:12%;
    width:73%;
}

</style>
