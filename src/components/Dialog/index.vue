<template>
  <el-dialog
    v-bind="dialogAttrs"
    :append-to-body="true"
    :class="dialogClass"
    :model-value="dialogVisible"
    :style="[dialogStyle, dialogCssVariables]"
    :title="title"
    :top="top"
    :width="iWidth"
    @update:model-value="handleVisibleChange"
  >
    <template v-if="$slots.header" #header="headerProps">
      <slot name="header" v-bind="headerProps" />
    </template>

    <div v-loading="disabledStatus">
      <slot />
    </div>

    <template v-if="shouldRenderFooter" #footer>
      <div class="dialog-footer">
        <slot name="footer">
          <el-button v-if="showCancel && showButtons" @click="onCancel">{{
            $t(cancelTitle)
          }}</el-button>
          <el-button
            v-if="showConfirm && showButtons"
            :disabled="disabledStatus"
            type="primary"
            @click="onConfirm"
          >
            {{ $t(confirmTitle) }}
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
    minWidth: {
      type: String,
      default: ''
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
    dialogCssVariables() {
      const variables = { '--dialog-max-width': this.maxWidth }
      if (this.minWidth) {
        variables['--dialog-min-width'] = this.minWidth
      }
      return variables
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
  min-width: min(var(--dialog-min-width, 0px), calc(100vw - 32px));

  &.shadow {
    box-shadow: 1px 2px 12px 0 rgba(0, 0, 0, 0.6);
  }

  .el-dialog__header {
    position: relative;
    box-sizing: border-box;
    padding: 15px 22px !important;
    border-bottom: 1px solid #dee2e6;
  }

  .el-dialog__title {
    font-size: 18px;
    font-weight: 400;
    color: var(--color-text-primary);
  }

  // 关闭按钮在标题栏内垂直居中(默认 top:0 + --el-dialog-padding-primary:0 会贴到顶部)
  .el-dialog__headerbtn {
    top: 50%;
    right: 14px;
    width: 32px;
    height: 32px;
    margin: 0;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;

    .el-dialog__close {
      color: var(--el-text-color-secondary);
    }

    &:hover,
    &:focus {
      .el-dialog__close {
        color: var(--el-color-primary);
      }
    }
  }

  .el-dialog__body {
    padding: 30px;
    font-size: 13px;
  }

  .el-dialog__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    border-top: 1px solid #dee2e6;
    padding: 16px 25px !important;
  }
}

@media (max-width: 900px) {
  .el-dialog.dialog {
    max-width: calc(100% - 30px);
  }
}

.dialog-fade-leave-active {
  pointer-events: none;
}
</style>
