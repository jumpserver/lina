<template>
  <transition name="dialog-fade">
    <el-dialog
      :append-to-body="true"
      :class="{ shadow: shadow }"
      :modal-append-to-body="true"
      :title="title"
      :top="top"
      :width="iWidth"
      class="dialog"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <div v-loading="disabledStatus">
        <slot />
      </div>

      <div v-if="showButtons" slot="footer" class="dialog-footer">
        <slot name="footer">
          <el-button v-if="showCancel && showButtons" size="small" @click="onCancel">{{ cancelTitle }}</el-button>
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
    </el-dialog>
  </transition>
</template>

<script>
export default {
  name: 'DialogComponent',
  props: {
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
  data() {
    return {}
  },
  computed: {
    iWidth() {
      return this.$store.getters.isMobile ? '1000px' : this.width
    }
  },
  methods: {
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

  .form-group-header {
    margin-left: 20px;
  }

  .el-form--label-top {
    .form-group-header {
      margin-left: 0;
    }
  }

  .el-icon-circle-check {
    display: none;
  }

  &.dialog__header {
    box-sizing: border-box;
    padding: 15px 22px;
    border-bottom: 1px solid #dee2e6;
    font-weight: 400;
  }

  &.dialog__body {
    padding: 20px 30px;
    font-size: 13px;

    &:has(.el-table) {
      background: #f3f3f4;
    }
  }

  &.dialog__footer {
    border-top: 1px solid #dee2e6;
    padding: 16px 25px;
    justify-content: flex-end;
  }
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

.dialog-fade-enter-active, .dialog-fade-leave-active {
  transition: opacity 1s ease;
}

.dialog-fade-enter, .dialog-fade-leave-to /* .dialog-fade-leave-active 在 <2.1.8 中以及被重复声明 */
{
  opacity: 0;
}

</style>
