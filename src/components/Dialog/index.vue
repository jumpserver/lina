<template>
  <el-dialog
    :append-to-body="true"
    :modal-append-to-body="true"
    :title="title"
    :top="top"
    :width="iWidth"
    class="dialog"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot />
    <div slot="footer" class="dialog-footer">
      <slot name="footer">
        <el-button v-if="showCancel && showButtons" @click="onCancel">{{ cancelTitle }}</el-button>
        <el-button v-if="showConfirm && showButtons" :loading="loadingStatus" type="primary" @click="onConfirm">
          {{ confirmTitle }}
        </el-button>
      </slot>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'Dialog',
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
      default: '60%'
    },
    showConfirm: {
      type: Boolean,
      default: true
    },
    confirmTitle: {
      type: String,
      default() {
        return this.$t('Confirm')
      }
    },
    showCancel: {
      type: Boolean,
      default: true
    },
    cancelTitle: {
      type: String,
      default() {
        return this.$t('Cancel')
      }
    },
    showButtons: {
      type: Boolean,
      default: true
    },
    loadingStatus: {
      type: Boolean,
      default: false
    },
    maxWidth: {
      type: String,
      default: '1200px'
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
  .dialog >>> .el-dialog {
    border-radius: 0.3em;
    max-width: 1500px;

    .form-group-header {
      margin-left: 20px;
    }

    //.el-form-item__label {
    //  width: 30% !important;
    //}
    //
    //.el-form-item__content {
    //  margin-left: 30% !important;
    //}

    .el-icon-circle-check {
      display: none;
    }

    &__header {
      box-sizing: border-box;
      padding: 15px 22px;
      border-bottom: 1px solid #dee2e6;
      font-weight: 400;
    }

    &__body {
      padding: 20px 30px;

      &:has(.el-table) {
        background: #f3f3f4;
      }
    }

    &__footer {
      border-top: 1px solid #dee2e6;
      padding: 16px;
      justify-content: flex-end;
    }
  }

  .dialog-footer >>> button.el-button {
    font-size: 13px;
    padding: 10px 20px;
  }
</style>
