<template>
  <div>
    <ElFormRender
      :id="id"
      ref="form"
      :class="[mobile ? 'mobile' : 'desktop']"
      :content="fields"
      :form="basicForm"
      :label-position="iLabelPosition"
      class="form-fields"
      :label-width="labelWidth"
      :style="{ '--label-width': labelWidth }"
      v-bind="$attrs"
      :server-errors="serverErrors"
      v-on="$listeners"
    >
      <!-- slot 透传 -->
      <slot v-for="item in fields" :slot="`id:${item.id}`" :name="`id:${item.id}`" />
      <slot v-for="item in fields" :slot="`$id:${item.id}`" :name="`$id:${item.id}`" />

      <div v-if="hasButtons" class="form-buttons">
        <el-button
          v-if="defaultButton"
          :disabled="!canSubmit"
          :loading="isSubmitting"
          :size="submitBtnSize"
          type="primary"
          @click="submitForm('form')"
        >
          {{ iSubmitBtnText }}
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
          v-show="!iHidden(button)"
          :key="button.title"
          :loading="button.loading"
          size="small"
          v-bind="button"
          @click="handleClick(button)"
        >
          {{ button.title }}
        </el-button>
      </div>
    </ElFormRender>
  </div>
</template>

<script>
import ElFormRender from './components/el-form-renderer'
import { randomString } from '@/utils/common/index'

const scrollToError = (
  formInstance,
  scrollOption = {
    behavior: 'smooth',
    block: 'center'
  }
) => {
  setTimeout(() => {
    // formInstance 是 ElFormRender 组件实例，需要访问内部的 el-form 元素
    const elForm = formInstance.$refs?.elForm
    if (!elForm || !elForm.$el) {
      return
    }
    const formEl = elForm.$el
    const errorElements = formEl.getElementsByClassName('is-error')
    if (errorElements && errorElements.length > 0) {
      errorElements[0].scrollIntoView(scrollOption)
    }
  }, 0)
}

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
        return ''
      }
    },
    hasSaveContinue: {
      type: Boolean,
      default: true
    },
    serverErrors: {
      type: Object,
      default: () => ({})
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
    },
    labelPosition: {
      type: String,
      default: ''
    },
    labelWidth: {
      type: String,
      default: '18.2%'
    }
  },
  data() {
    return {
      basicForm: this.form,
      id: randomString(16),
      iSubmitBtnText: this.submitBtnText
    }
  },
  computed: {
    elForm() {
      return this.$refs.form
    },
    mobile() {
      return this.$store.state.app.device === 'mobile'
    },
    drawer() {
      return this.$store.state.common.inDrawer
    },
    iLabelPosition() {
      if (this.labelPosition) {
        return this.labelPosition
      }
      // if (this.drawer) {
      //   return 'left'
      // }
      // return this.drawer || this.mobile ? 'top' : 'right'
      return this.mobile ? 'top' : 'right'
    }
  },
  mounted() {
    this.autoSetSubmitBtnText()
  },
  methods: {
    autoSetSubmitBtnText() {
      if (this.iSubmitBtnText) {
        return
      }
      const dialogs = [...document.getElementsByClassName('el-dialog__body')]
      if (dialogs.length > 0) {
        const dialog = dialogs.find(d => d.innerHTML.indexOf(this.id) !== -1)
        if (dialog) {
          this.iSubmitBtnText = this.$t('Confirm')
          return
        }
      }
      this.iSubmitBtnText = this.$t('Submit')
    },
    /**
     * 提交表单数据
     * @param {string} formName - 表单的引用名称
     * @param {boolean} [addContinue] - 是否继续添加
     */
    async submitForm(formName, addContinue) {
      const form = this.$refs[formName]
      try {
        await form.validate()
        this.$emit('submit', form.getFormValue(), form, addContinue)
      } catch (error) {
        this.$emit('invalid', false)
        scrollToError(form)
        return false
      }
    },
    // 重置表单
    resetForm() {
      this.$refs['form'].resetFields()
    },
    handleClick(button) {
      const callback =
        button.callback ||
        function(values, form) {
          // debug('Click ', button.title, ': ', values)
        }
      const form = this.$refs['form']
      const values = form.getFormValue()
      callback(values, form, button)
    },
    getFormValue() {
      return this.$refs.form.getFormValue()
    },
    iHidden(item) {
      return typeof item.hidden === 'function' ? item.hidden() : item.hidden
    }
  }
}
</script>

<style lang="less" scoped>
.el-form {
  margin-right: 80px;
  margin-bottom: 20px;

  .el-form {
    margin-right: 0;
  }

  :deep(.el-input-group__prepend) {
    border-radius: 0;
  }

  :deep(.form-group-header) {
    margin-left: 50px;
    color: var(--color-text-primary);
  }

  &.label-top {
    :deep(.el-form-item) {
      .el-form-item__content {
        width: 100%;
      }
    }
  }

  :deep(.el-form-item) {
    margin-bottom: 10px;

    .el-form-item__label {
      padding: 0 30px 0 0;
      line-height: 30px;
      color: var(--color-text-primary);

      span {
        display: unset;
      }

      i {
        color: var(--color-icon-primary);
      }

      span {
        max-width: calc(100% - 25px);
        //white-space: nowrap; /* 禁止换行 */
        //text-overflow: ellipsis;
        overflow: hidden;
        display: inline-block;
        line-height: 16px;
      }
    }

    .el-form-item__content {
      width: calc(100% - var(--label-width));
      line-height: 32px;

      // 禁用的输入框
      .el-input.is-disabled .el-input__inner {
        color: var(--color-icon-primary) !important;
        background-color: var(--color-disabled-background);
      }

      // 复合型输入框
      .el-input.el-input-group {
        .el-input-group__prepend .el-select {
          .el-input__inner {
            border: none;
            height: 28px;
          }
        }

        .el-input__inner {
          border-radius: 0;
          color: var(--color-text-primary);
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

  :deep(.form-buttons) {
    margin-top: 30px;
    margin-left: var(--label-width);
  }
}

.mobile.el-form :deep(.el-form-item__content) {
  width: 100%;
}

.el-form.mobile :deep(.form-group-header) {
  margin-left: 0;
}
</style>
