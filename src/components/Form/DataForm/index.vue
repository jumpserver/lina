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

  ::v-deep .el-input-group__prepend {
    border-radius: 0;
  }

  ::v-deep .form-group-header {
    margin-left: 50px;
    color: var(--color-text-primary);
  }

  ::v-deep .el-form-item {
    margin-bottom: 10px;

    .item-params {
      margin-top: 0;
    }

    .el-form-item__label {
      padding: 0 30px 0 0;
      line-height: 32px;
      color: var(--color-text-primary);

      i {
        color: var(--color-icon-primary);
      }
    }

    .el-form-item__content {
      width: 75%;
      line-height: 32px;

      // 禁用的输入框
      .el-input.is-disabled .el-input__inner {
        color: var(--color-icon-primary) !important;
        background-color: var(--color-disabled-background);
      }

      // 复合型输入框
      .el-input.el-input-group {
        .el-input-group__prepend {
          border-right: 0 !important;

          .el-select {
            border-bottom-right-radius: 0 !important;
            border-top-right-radius: 0 !important;

            .el-input__inner {
              border: none;
            }
          }
        }

        .el-input__inner {
          border-radius: 0;
          color: var(--color-text-primary);
        }

        .el-input-group__append {
          border: 1px solid var(--color-input-border);
          border-left: 0 !important;
        }
      }

      // 普通的输入框
      .el-input .el-input__inner {
        color: var(--color-text-primary);
      }

      // 不符合校验规则的提示信息
      .el-form-item__error {
        position: inherit;
      }

      .el-select {
        // 选择 tag 时的额外自定义样式
        .el-select__tags > span > .el-tag.el-tag--info {
          .el-tag__close.el-icon-close {
            margin-top: -1px !important;
          }
        }

        // 选择普通 item 时的样式
        .el-input .el-input__inner {
          color: var(--color-text-primary);
        }
      }

      .el-textarea .el-textarea__inner {
        border-radius: 0;
      }

      .el-data-table .el-table {
        margin: 5px 0;
      }

      .help-block {
        display: block;
        margin-top: 2px;
        margin-bottom: 5px;
        color: var(--color-help-text);
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
