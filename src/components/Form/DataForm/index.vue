<template>
  <ElFormRender
    ref="form"
    :class="mobile? 'mobile' : 'desktop'"
    :content="fields"
    :form="basicForm"
    :label-position="labelPosition"
    label-width="25%"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <!-- slot 透传 -->
    <slot v-for="item in fields" :slot="`id:${item.id}`" :name="`id:${item.id}`" />
    <slot v-for="item in fields" :slot="`$id:${item.id}`" :name="`$id:${item.id}`" />

    <el-form-item v-if="hasButtons" class="form-buttons">
      <el-button
        v-if="defaultButton"
        :disabled="!canSubmit"
        :loading="isSubmitting"
        :size="submitBtnSize"
        type="primary"
        @click="submitForm('form')"
      >
        {{ submitBtnText }}
      </el-button>
      <el-button
        v-if="defaultButton && hasSaveContinue"
        size="small"
        @click="submitForm('form', true)"
      >
        {{ $t('SaveAndAddAnother') }}
      </el-button>
      <el-button v-if="defaultButton && hasReset" size="small" @click="resetForm('form')">
        {{ $t('Reset') }}
      </el-button>
      <el-button
        v-for="button in moreButtons"
        :key="button.title"
        :loading="button.loading"
        size="small"
        v-bind="button"
        @click="handleClick(button)"
      >
        {{ button.title }}
      </el-button>
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
    canSubmit: {
      type: Boolean,
      default: true
    },
    submitBtnSize: {
      type: String,
      default: 'small'
    },
    submitBtnText: {
      type: String,
      default() {
        return this.$t('Submit')
      }
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
    elForm() {
      return this.$refs.form
    },
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
    resetForm() {
      this.$refs['form'].resetFields()
    },
    handleClick(button) {
      const callback = button.callback || function(values, form) {
        // debug('Click ', button.title, ': ', values)
      }
      const form = this.$refs['form']
      const values = form.getFormValue()
      callback(values, form, button)
    },
    getFormValue() {
      return this.$refs.form.getFormValue()
    }
  }
}
</script>

<style lang="less" scoped>
.el-form {
  margin-right: 80px;

  ::v-deep .form-group-header {
    margin-left: 50px;
    color: var(--el-text-color);
  }

  ::v-deep .el-form-item {
    margin-bottom: 10px;

    .el-form-item__label {
      padding: 0 30px 0 0;
      line-height: 32px;
      color: var(--el-text-color);

      i {
        color: var(--el-icon-color);
      }
    }

    .el-form-item__content {
      width: 75%;
      line-height: 32px;

      .el-input .el-input__inner {
        color: var(--el-text-color);
        //border: 1px solid var(--el-input-border-color);
      }

      .el-form-item__error {
        position: inherit;
        color: var(--el-form-tip-text-color);
      }

      .help-block {
        display: block;
        margin-top: 2px;
        margin-bottom: 5px;
        color: var(--el-form-tip-text-color);
        font-size: 12px;
        line-height: 18px;
        word-break: keep-all;

        a {
          color: var(--color-primary);
        }
      }
    }
  }

  ::v-deep .el-form-item.form-buttons {
    margin-top: 20px;
  }
}

.mobile.el-form ::v-deep .el-form-item__content {
  width: 100%;
}

.el-form.mobile ::v-deep .form-group-header {
  margin-left: 0;
}
</style>
s
