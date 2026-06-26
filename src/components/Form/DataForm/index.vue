<template>
  <div>
    <ElFormRender
      v-bind="$attrs"
      :id="id"
      ref="form"
      :class="[mobile ? 'mobile' : 'desktop', { 'dialog-mode': inDialog }]"
      :content="processedFields"
      :form="basicForm"
      :label-position="iLabelPosition"
      class="form-fields"
      :label-width="labelWidth"
      :style="{
        '--label-width': labelWidth,
        '--form-column-gap': '8px',
        '--form-section-gap': '20px'
      }"
      :server-errors="serverErrors"
      @input="handleFormUpdate"
      @update:form="handleFormUpdate"
    >
      <!-- named slot 透传给 ElFormRender，保持与字段渲染顺序一致 -->
      <template v-for="item in processedFields" :key="`id:${item.id}`" #[`id:${item.id}`]>
        <slot :name="`id:${item.id}`" />
      </template>
      <template v-for="item in processedFields" :key="`$id:${item.id}`" #[`$id:${item.id}`]>
        <slot :name="`$id:${item.id}`" />
      </template>

      <div v-if="hasButtons" class="form-buttons">
        <el-button
          v-if="defaultButton"
          :disabled="!canSubmit"
          :loading="isSubmitting"
          :size="submitBtnSize"
          class="form-submit-button"
          type="primary"
          @click="handlePrimarySubmitClick"
        >
          {{ iSubmitBtnText }}
        </el-button>

        <el-button
          v-if="defaultButton && hasSaveContinue"
          class="form-secondary-button"
          @click="handleSaveContinueClick"
        >
          {{ $t('SaveAndAddAnother') }}
        </el-button>

        <el-button
          v-if="defaultButton && hasReset"
          class="form-secondary-button"
          @click="handleResetClick"
        >
          {{ $t('Reset') }}
        </el-button>

        <el-button
          v-bind="button"
          v-for="button in moreButtons"
          v-show="!iHidden(button)"
          :key="button.title"
          class="form-secondary-button"
          :loading="button.loading"
          @click="handleClick(button)"
        >
          {{ button.title }}
        </el-button>
      </div>
    </ElFormRender>
  </div>
</template>

<script>
import { randomString } from '@/utils/common/index'
import { markRaw, toRaw } from 'vue'
import ElFormRender from './components/el-form-renderer'

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
    ElFormRender: markRaw(ElFormRender)
  },
  inheritAttrs: true,
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
      default: 'default'
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
  emits: ['submit', 'invalid', 'input', 'update:form'],
  data() {
    return {
      basicForm: this.form,
      id: randomString(16),
      iSubmitBtnText: this.submitBtnText,
      inDialog: false
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
    },
    processedFields() {
      function markComponents(fields) {
        if (!Array.isArray(fields)) return fields
        return fields.map((field) => {
          if (!field) return field
          if (typeof field === 'string') return field
          const f = { ...field }
          if (f.component && typeof f.component !== 'string') {
            f.component = markRaw(toRaw(f.component))
          }
          if (f.fields) {
            f.fields = markComponents(f.fields)
          }
          if (f.children) {
            f.children = markComponents(f.children)
          }
          return f
        })
      }
      return markComponents(this.fields)
    }
  },
  mounted() {
    this.detectDialogMode()
    this.autoSetSubmitBtnText()
  },
  methods: {
    detectDialogMode() {
      this.$nextTick(() => {
        const root = this.$el
        this.inDialog = !!root?.closest?.('.el-dialog__body')
      })
    },
    handlePrimarySubmitClick(event) {
      return this.submitForm('form')
    },
    handleSaveContinueClick(event) {
      return this.submitForm('form', true)
    },
    handleResetClick(event) {
      return this.resetForm('form')
    },
    handleFormUpdate(value) {
      this.$emit('input', value)
      this.$emit('update:form', value)
    },
    autoSetSubmitBtnText() {
      if (this.iSubmitBtnText) {
        return
      }
      const dialogs = [...document.getElementsByClassName('el-dialog__body')]
      if (dialogs.length > 0) {
        const dialog = dialogs.find((d) => d.innerHTML.indexOf(this.id) !== -1)
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
        const formValue = form.getFormValue()
        this.$emit('submit', formValue, form, addContinue)
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
        function (values, form) {
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

<style lang="scss" scoped>
.form-fields.el-form {
  display: flex;
  flex-direction: column;
  gap: var(--form-section-gap);
  margin: 0;
  padding: 20px 0 24px;

  .el-form {
    margin-right: 0;
    margin-bottom: 0;
  }

  :deep(.el-input-group__prepend) {
    border-radius: 0;
  }

  :deep(.form-group-header) {
    color: var(--color-text-primary);
  }

  &.label-top {
    :deep(.el-form-item) {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;

      .el-form-item__label-wrap {
        width: 100%;
        flex-basis: auto;
      }

      .el-form-item__label {
        justify-content: flex-start;
      }

      .el-form-item__content {
        width: 100%;
        min-width: 100%;
      }
    }
  }

  :deep(.el-form-item) {
    display: flex;
    align-items: flex-start;
    gap: var(--form-column-gap);
    margin: 0;

    .el-form-item__label-wrap {
      margin-left: 0 !important;
      margin-right: 0 !important;
      flex: 0 0 var(--label-width);
      width: var(--label-width);
      min-width: 0;
    }

    .el-form-item__label {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      min-height: 30px;
      padding: 0;
      line-height: 30px;
      color: var(--color-text-primary);
      box-sizing: border-box;

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
      flex: 1 1 auto;
      width: auto;
      min-width: 0;
      min-height: 30px;
      line-height: 30px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: flex-start;

      .el-input:not(.el-date-editor),
      .el-select,
      .el-cascader,
      .el-input-number,
      .el-date-editor.el-input,
      .el-date-editor.el-date-editor--date,
      .el-date-editor.el-date-editor--datetime,
      .el-date-editor.el-date-editor--daterange,
      .el-date-editor.el-date-editor--datetimerange {
        min-height: 30px;
      }

      .el-input__wrapper,
      .el-select__wrapper,
      .el-cascader .el-input__wrapper,
      .el-input-group__prepend,
      .el-input-group__append,
      .el-date-editor.el-input,
      .el-date-editor--daterange,
      .el-date-editor--datetimerange {
        min-height: 30px;
        height: 30px;
        box-sizing: border-box;
        border-radius: 0;
      }

      .el-input__wrapper,
      .el-select__wrapper,
      .el-cascader .el-input__wrapper {
        box-shadow: none !important;
        border: 1px solid var(--el-border-color) !important;

        &:hover {
          border-color: var(--el-border-color-hover) !important;
        }

        &.is-focus,
        &.is-focused {
          box-shadow: none !important;
          border-color: var(--el-color-primary) !important;
        }
      }

      // 自定义复合组件（如 TagInput 的 .filter-field）自带容器边框，其内部输入框不应再被
      // 上面的强制 border 命中，否则形成 border 套 border 的双层边框。
      .filter-field {
        .el-input__wrapper {
          border: 0 !important;
        }
      }

      // 组合型输入框（input-group）：prepend/append 自带外边框，
      // 内部 wrapper 不再于接缝处重复描边，避免 border 套 border 的双层边框。
      .el-input-group {
        .el-input-group__prepend + .el-input__wrapper {
          border-left: 0 !important;
        }

        .el-input__wrapper:has(+ .el-input-group__append) {
          border-right: 0 !important;
        }
      }

      .el-select,
      .el-select .el-tooltip__trigger {
        border-radius: 0;
      }

      .el-input__inner,
      .el-select .el-input__inner,
      .el-date-editor .el-range-input,
      .el-date-editor .el-range-separator,
      .el-date-editor .el-range__icon,
      .el-date-editor .el-range__close-icon {
        min-height: 28px;
        height: 28px;
        line-height: 28px;
      }

      .el-input__wrapper .el-input__inner,
      .el-select__wrapper .el-select__selected-item,
      .el-select__wrapper .el-select__placeholder {
        border: 0 !important;
        box-shadow: none !important;
        padding-left: 0 !important;
        margin-left: 0 !important;
      }

      .el-input__wrapper {
        padding: 1px 11px;
      }

      // 禁用的输入框
      .el-input.is-disabled .el-input__inner {
        color: var(--color-icon-primary) !important;
        background-color: var(--color-disabled-background);
      }

      // 复合型输入框
      .el-input.el-input-group {
        .el-input-group__prepend .el-select {
          min-height: 30px;

          .el-input__wrapper {
            min-height: 28px;
            height: 28px;
            box-shadow: none;
          }

          .el-input__inner {
            border: none;
            height: 28px;
            line-height: 28px;
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
          min-height: 24px;
          height: 24px;
          line-height: 22px;

          .el-tag__close {
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
        margin: 0;
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
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
    padding-inline-start: calc(var(--label-width) + var(--form-column-gap));

    .el-button {
      min-height: 30px;
      height: 30px;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 400;
      line-height: 1;
    }

    .el-button--primary,
    .el-button--primary > span,
    .el-button--primary:hover,
    .el-button--primary:hover > span,
    .el-button--primary:focus,
    .el-button--primary:focus > span,
    .el-button--primary:active,
    .el-button--primary:active > span {
      color: #fff;
    }
  }
}

.form-fields.el-form.dialog-mode {
  padding: 0;

  :deep(.form-group-header) {
    &:first-child {
      margin-top: 0;
    }
  }

  :deep(.form-buttons) {
    margin-top: 16px;
    margin-bottom: 0;
  }
}

.mobile.el-form :deep(.el-form-item) {
  gap: 8px;
}

.mobile.el-form :deep(.el-form-item__label-wrap) {
  width: 100%;
  flex-basis: auto;
}

.mobile.el-form :deep(.el-form-item__content) {
  width: 100%;
  flex-basis: 100%;
}

.el-form.mobile {
  padding: 16px 0 20px;

  :deep(.form-buttons) {
    padding-inline-start: 0;
  }
}

.el-form.mobile.dialog-mode {
  padding: 0;
}
</style>
