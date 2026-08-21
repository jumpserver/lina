<template>
  <div class="data-form-container">
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
        '--form-column-gap': '18px',
        '--form-section-gap': '15px'
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
      id: randomString(16),
      iSubmitBtnText: this.submitBtnText,
      inDialog: false
    }
  },
  computed: {
    basicForm() {
      return this.form
    },
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
.data-form-container {
  width: 100%;
  min-width: 0;
  container-name: data-form;
  container-type: inline-size;
}

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
      height: auto;
      min-height: 30px;
      padding: 0;
      overflow: visible;
      line-height: 30px;
      font-size: 13px;
      color: var(--color-text-primary);
      box-sizing: border-box;

      i {
        color: var(--color-icon-primary);
      }

      > span {
        max-width: 100%;
        overflow: visible;
        overflow-wrap: anywhere;
        display: inline-block;
        line-height: 16px;
        white-space: normal;
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
    }
  }

  :deep(.form-buttons) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
    padding-inline-start: calc(var(--label-width) + var(--form-column-gap));
  }

  &.el-form--label-top,
  &.label-top {
    :deep(.el-form-item) {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
    }

    :deep(.el-form-item__label-wrap) {
      flex: 0 0 auto !important;
      width: 100% !important;
    }

    :deep(.el-form-item__label) {
      width: 100% !important;
      justify-content: flex-start;
      text-align: left;
    }

    :deep(.el-form-item__label > span) {
      display: inline-flex;
      max-width: 100%;
      overflow: visible;
      overflow-wrap: anywhere;
    }

    :deep(.el-form-item__content) {
      flex-basis: auto;
      width: 100%;
      min-width: 0;
    }

    :deep(.form-buttons) {
      padding-inline-start: 0;
    }

    :deep(.form-group-header) {
      margin-left: 0;
    }
  }
}

.form-fields.el-form.dialog-mode {
  padding: 0;
  margin-right: 30px;

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

/*
 * 设置页即使运行在 desktop 设备上，也可能因抽屉或分栏被压缩。此处按表单自身宽度
 * 切换布局，避免百分比 label 被挤成逐字换行，并让帮助文案跟随控件完整展示。
 */
@container data-form (max-width: 640px) {
  .form-fields.el-form {
    :deep(.el-form-item) {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
    }

    :deep(.el-form-item .el-form-item__label-wrap) {
      flex: 0 0 auto !important;
      width: 100% !important;
    }

    :deep(.el-form-item .el-form-item__label) {
      width: 100% !important;
      justify-content: flex-start;
      text-align: left;
    }

    :deep(.el-form-item .el-form-item__label > span) {
      display: inline-flex;
      max-width: 100%;
      overflow: visible;
      overflow-wrap: anywhere;
    }

    :deep(.el-form-item .el-form-item__content) {
      width: 100%;
      min-width: 0;
      flex-basis: auto;
    }

    :deep(.help-block) {
      width: 100%;
      overflow-wrap: anywhere;
      word-break: break-word;
    }

    :deep(.form-group-header) {
      margin-left: 0;
    }

    :deep(.form-buttons) {
      padding-inline-start: 0;
    }
  }
}
</style>
