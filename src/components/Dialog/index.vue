<template>
  <el-dialog
    v-bind="dialogAttrs"
    :append-to-body="true"
    :class="dialogClass"
    :model-value="dialogVisible"
    :style="dialogStyle"
    :title="title"
    :top="top"
    :width="iWidth"
    @update:model-value="handleVisibleChange"
  >
    <div v-loading="disabledStatus">
      <slot />
    </div>

    <template v-if="showButtons" #footer>
      <div class="dialog-footer">
        <slot name="footer">
          <el-button v-if="showCancel && showButtons" size="small" @click="onCancel">{{
            cancelTitle
          }}</el-button>
          <el-button
            v-if="showConfirm && showButtons"
            :disabled="disabledStatus"
            size="small"
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

<style lang="scss" scoped>
.dialog.shadow :deep(.el-dialog) {
  box-shadow: 1px 2px 12px 0 rgba(0, 0, 0, 0.6);
}

.dialog :deep(.el-dialog) {
  border-radius: 0.3em;
  max-width: min(100vw, 1500px);
}

.dialog :deep(.el-dialog__header) {
  box-sizing: border-box;
  padding: 15px 22px;
  border-bottom: 1px solid #dee2e6;
  font-weight: 400;
}

.dialog :deep(.el-dialog__body) {
  padding: 20px 30px;
  font-size: 13px;

  &:has(.el-table) {
    background: #f3f3f4;
  }
}

.dialog :deep(.el-dialog__footer) {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #dee2e6;
  padding: 16px 25px;
}

@media (max-width: 900px) {
  .dialog :deep(.el-dialog) {
    max-width: calc(100% - 30px);
  }
}

.dialog-footer :deep(button.el-button) {
  font-size: 13px;
  padding: 8px 12px;
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 1s ease;
}

.dialog-fade-enter, .dialog-fade-leave-to /* .dialog-fade-leave-active 在 <2.1.8 中以及被重复声明 */ {
  opacity: 0;
}
</style>
