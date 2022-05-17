<template>
  <ElFormRender
    ref="form"
    :class="mobile? 'mobile' : 'desktop'"
    :content="fields"
    :form="basicForm"
    :label-position="labelPosition"
    label-width="20%"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <!-- slot 透传 -->
    <slot v-for="item in fields" :slot="`id:${item.id}`" :name="`id:${item.id}`" />
    <slot v-for="item in fields" :slot="`$id:${item.id}`" :name="`$id:${item.id}`" />

    <el-form-item v-if="hasButtons" class="form-buttons">
      <el-button v-for="button in moreButtons" :key="button.title" size="small" v-bind="button" @click="handleClick(button)">{{ button.title }}</el-button>
      <el-button v-if="defaultButton && hasReset" size="small" @click="resetForm('form')">{{ $t('common.Reset') }}</el-button>
      <el-button v-if="defaultButton && hasSaveContinue" size="small" @click="submitForm('form', true)">{{ $t('common.SaveAndAddAnother') }}</el-button>
      <el-button v-if="defaultButton" size="small" :loading="isSubmitting" type="primary" @click="submitForm('form')">{{ $t('common.Submit') }}</el-button>
    </el-form-item>
  </ElFormRender>
</template>

<script>
import ElFormRender from './components/el-form-renderer'
import { scrollToError } from '@/utils'
export default {
  components: {
    ElFormRender
  },
  props: {
    defaultButton: {
      type: Boolean,
      default: true
    },
    hasButtons: {
      type: Boolean,
      default: true
    },
    hasReset: {
      type: Boolean,
      default: true
    },
    hasSaveContinue: {
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
      default: () => ({})
    },
    moreButtons: {
      type: Array,
      default: () => []
    },
    isSubmitting: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      basicForm: this.form
    }
  },
  computed: {
    mobile() {
      return this.$store.state.app.device === 'mobile'
    },
    labelPosition() {
      return this.mobile ? 'top' : 'right'
    }
  },
  methods: {
    // 获取表单数据
    submitForm(formName, addContinue) {
      const form = this.$refs[formName]
      form.validate((valid) => {
        if (valid) {
          this.$emit('submit', form.getFormValue(), form, addContinue)
        } else {
          this.$emit('invalid', valid)
          scrollToError(form.$el)
          return false
        }
      })
    },
    // 重置表单
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    handleClick(button) {
      const callback = button.callback || function(values, form) {
        // debug('Click ', button.title, ': ', values)
      }
      const form = this.$refs['form']
      const values = form.getFormValue()
      callback(values, form)
    }
  }
}
</script>

<style lang="less" scoped>
  .el-form ::v-deep .el-form-item {
    margin-bottom: 12px;
  }

  .el-form ::v-deep .el-form-item__content {
    width: 75%;
  }

  .mobile.el-form ::v-deep .el-form-item__content {
    width: 100%;
  }

  .el-form ::v-deep .el-form-item__label {
    padding: 0 30px 0 0;
  }

  .el-form ::v-deep .el-form-item__error {
     position: inherit;
  }

  .el-form ::v-deep .form-group-header {
    margin-left: 50px;
  }

  .el-form.mobile ::v-deep .form-group-header {
    margin-left: 0;
  }

  .el-form ::v-deep .help-block {
    display: block;
    margin-top: 5px;
    margin-bottom: 10px;
    color: #999;
    font-size: 12px;
    line-height: 18px;
  }
  .el-form ::v-deep .help-block a {
    color: #1c84c6;
  }
  .form-buttons {
    padding-top: 10px;
  }
</style>
