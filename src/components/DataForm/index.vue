<template>
  <ElFormRender
    ref="dataForm"
    :content="fields"
    v-bind="$attrs"
    :form="basicForm"
    label-position="right"
    label-width="17%"
    v-on="$listeners"
  >
    <!-- slot 透传 -->
    <slot v-for="item in fields" :slot="`id:${item.id}`" :name="`id:${item.id}`" />
    <slot v-for="item in fields" :slot="`$id:${item.id}`" :name="`$id:${item.id}`" />

    <el-form-item v-if="defaultButton">
      <el-button size="small" @click="resetForm('dataForm')">{{ $tc('Reset') }}</el-button>
      <el-button size="small" type="primary" @click="submitForm('dataForm')">{{ $tc('Submit') }}</el-button>
    </el-form-item>
    <slot name="Actions" />
  </ElFormRender>
</template>

<script>
import ElFormRender from './components/el-form-renderer'
export default {
  components: {
    ElFormRender
  },
  props: {
    defaultButton: {
      type: Boolean,
      default: true
    },
    fields: {
      type: Array,
      default: () => []
    },
    // 初始值
    form: {
      type: Object,
      default: () => { return {} }
    }
  },
  data() {
    return {
      basicForm: {}
    }
  },
  mounted() {
    this.basicForm = this.form
  },
  methods: {
    // 获取表单数据
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$emit('submit', this.$refs[formName].getFormValue())
        } else {
          return false
        }
      })
    },
    // 重置表单
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

  .el-form /deep/ .el-form-item__content {
    width: 75%;
  }

  .el-form /deep/ .el-form-item__label {
    padding: 0 30px 0 0;
  }

  .el-form /deep/ .el-form-item__error {
     position: inherit;
  }

  .el-form /deep/ .form-group-header {
    margin-left: 50px;
  }
</style>
