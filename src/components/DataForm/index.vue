<template>
  <ElFormRender
    ref="form"
    :content="fields"
    :form="basicForm"
    label-position="right"
    label-width="17%"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <!-- slot 透传 -->
    <slot v-for="item in fields" :slot="`id:${item.id}`" :name="`id:${item.id}`" />
    <slot v-for="item in fields" :slot="`$id:${item.id}`" :name="`$id:${item.id}`" />

    <el-form-item>
      <el-button v-for="button in moreButtons" :key="button.title" size="small" v-bind="button" @click="button.callback">{{ button.title }}</el-button>
      <el-button v-if="defaultButton" size="small" @click="resetForm('form')">{{ $tc('Reset') }}</el-button>
      <el-button v-if="defaultButton" size="small" type="primary" @click="submitForm('form')">{{ $tc('Submit') }}</el-button>
    </el-form-item>
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
    },
    moreButtons: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      basicForm: this.form
    }
  },
  methods: {
    // 获取表单数据
    submitForm(formName) {
      const form = this.$refs[formName]
      form.validate((valid) => {
        if (valid) {
          this.$emit('submit', form.getFormValue(), form)
        } else {
          this.$emit('invalid', valid)
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

  .el-form /deep/ .help-block {
    display: block;
    margin-top: 5px;
    margin-bottom: 10px;
    color: #999;
    font-size: 12px;
    line-height: 18px;
  }
  .el-form /deep/ .help-block a {
    color: #1c84c6;
  }
</style>
