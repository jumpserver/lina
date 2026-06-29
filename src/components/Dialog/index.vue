<template>
  <el-dialog
    v-bind="dialogAttrs"
    :append-to-body="true"
    :class="dialogClass"
    :model-value="dialogVisible"
    :style="[dialogStyle, { '--dialog-max-width': maxWidth }]"
    :title="title"
    :top="top"
    :width="iWidth"
    @update:model-value="handleVisibleChange"
  >
    <div v-loading="disabledStatus">
      <slot />
    </div>

    <template v-if="shouldRenderFooter" #footer>
      <div class="dialog-footer">
        <slot name="footer">
          <el-button v-if="showCancel && showButtons" @click="onCancel">{{
            cancelTitle
          }}</el-button>
          <el-button
            v-if="showConfirm && showButtons"
            :disabled="disabledStatus"
            type="primary"
            @click="onConfirm"
          >
            {{ confirmTitle }}
          </el-button>
        </slot>
      </div>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'DialogComponent',
  inheritAttrs: false,
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Title'
    },
    top: {
      type: String,
      default: '3vh'
    },
    width: {
      type: String,
      default: '800px'
    },
    showConfirm: {
      type: Boolean,
      default: true
    },
    confirmTitle: {
      type: String,
      default() {
        return 'Confirm'
      }
    },
    showCancel: {
      type: Boolean,
      default: true
    },
    cancelTitle: {
      type: String,
      default() {
        return 'Cancel'
      }
    },
    showButtons: {
      type: Boolean,
      default: true
    },
    disabledStatus: {
      type: Boolean,
      default: false
    },
    maxWidth: {
      type: String,
      default: '1200px'
    },
    shadow: {
      type: Boolean,
      default: true
    }
  },
  emits: ['cancel', 'confirm', 'update:visible', 'update:modelValue'],
  data() {
    return {}
  },
  computed: {
    dialogAttrs() {
      const attrs = { ...this.$attrs }
      delete attrs.class
      delete attrs.style
      delete attrs['custom-class']
      return attrs
    },
    dialogVisible() {
      return this.visible
    },
    shouldRenderFooter() {
      return this.showButtons && (this.showCancel || this.showConfirm || !!this.$slots.footer)
    },
    dialogClass() {
      return ['dialog', { shadow: this.shadow }, this.$attrs.class, this.$attrs['custom-class']]
    },
    dialogStyle() {
      return this.$attrs.style
    },
    iWidth() {
      return this.$store.getters.isMobile ? '1000px' : this.width
    }
  },
  methods: {
    handleVisibleChange(val) {
      this.$emit('update:visible', val)
      this.$emit('update:modelValue', val)
    },
    onCancel() {
      this.$emit('cancel')
    },
    onConfirm() {
      this.$emit('confirm')
    }
  }
}
</script>

<style lang="scss">
.el-dialog.dialog {
  --el-dialog-padding-primary: 0;
  padding: 0 !important;
  border-radius: 0.3em;
  max-width: min(calc(100vw - 32px), var(--dialog-max-width));

  &.shadow {
    box-shadow: 1px 2px 12px 0 rgba(0, 0, 0, 0.6);
  }

  .el-dialog__header {
    box-sizing: border-box;
    padding: 15px 22px !important;
    border-bottom: 1px solid #dee2e6;
  }

  .el-dialog__title {
    font-size: 18px;
    font-weight: 400;
    color: var(--color-text-primary);
  }

  .el-dialog__body {
    padding: 20px 30px !important;
    font-size: 13px;
  }

  .el-dialog__body .el-form {
    margin: 0;

    .el-form-item {
      margin-bottom: 20px;
    }

    .el-form-item:last-child {
      margin-bottom: 0;
    }

    .el-form-item__label {
      min-height: 30px;
      line-height: 30px;
      color: var(--color-text-primary);
    }

    .el-form-item__content {
      min-height: 30px;
      line-height: 30px;
    }

    .el-input,
    .el-select,
    .el-input-number,
    .el-input__wrapper,
    .el-select__wrapper,
    .el-date-editor.el-input,
    .el-date-editor--daterange,
    .el-date-editor--datetimerange {
      min-height: 30px;
      height: 30px;
    }

    .el-input__wrapper,
    .el-select__wrapper,
    .el-input-group__prepend,
    .el-input-group__append {
      box-sizing: border-box;
      border-radius: 0;
    }

    .el-input__wrapper,
    .el-select__wrapper,
    .el-cascader .el-input__wrapper {
      box-shadow: none !important;
      border: 1px solid var(--el-border-color) !important;
    }

    .el-input__wrapper:hover,
    .el-select__wrapper:hover,
    .el-cascader .el-input__wrapper:hover {
      border-color: var(--el-border-color-hover) !important;
    }

    .el-input__wrapper.is-focus,
    .el-select__wrapper.is-focused,
    .el-cascader .el-input__wrapper.is-focus {
      box-shadow: none !important;
      border-color: var(--el-color-primary) !important;
    }

    .el-input__inner,
    .el-select__selected-item,
    .el-select__placeholder,
    .el-date-editor .el-range-input,
    .el-date-editor .el-range-separator,
    .el-date-editor .el-range__icon,
    .el-date-editor .el-range__close-icon {
      min-height: 28px;
      height: 28px;
      line-height: 28px;
    }
  }

  .el-dialog__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    border-top: 1px solid #dee2e6;
    padding: 16px 25px !important;
  }

  .dialog-footer {
    .el-button {
      min-height: 30px;
      padding: 8px 12px;
      font-size: 13px;
      font-weight: 400;
      line-height: 1;

      > span {
        display: inline-flex;
        align-items: center;
        line-height: 1;
      }
    }
  }
}

@media (max-width: 900px) {
  .el-dialog.dialog {
    max-width: calc(100% - 30px);
  }
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 1s ease;
}

.dialog-fade-enter, .dialog-fade-leave-to /* .dialog-fade-leave-active 在 <2.1.8 中以及被重复声明 */ {
  opacity: 0;
}
</style>
