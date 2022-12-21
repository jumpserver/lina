<template>
  <el-dialog
    :title="title"
    :top="top"
    :width="iWidth"
    class="dialog"
    :append-to-body="true"
    :modal-append-to-body="true"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot />
    <div slot="footer" class="dialog-footer">
      <slot name="footer">
        <el-button v-if="showCancel" @click="onCancel">{{ cancelTitle }}</el-button>
        <el-button v-if="showConfirm" type="primary" :loading="loadingStatus" @click="onConfirm">
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
    showCancel: {
      type: Boolean,
      default: true
    },
    cancelTitle: {
      type: String,
      default() {
        return this.$t('common.Cancel')
      }
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
    loadingStatus: {
      type: Boolean,
      default: false
    },
    confirmTitle: {
      type: String,
      default() {
        return this.$t('common.Confirm')
      }
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
      return this.$store.getters.isMobile ? '80%' : this.width
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
  .dialog /deep/ .el-dialog {
    border-radius: 0.3em;
    max-width: 1500px;

    &__header {
      box-sizing: border-box;
      padding: 15px 22px;
      border-bottom: 1px solid #dee2e6;
      font-weight: 400;
    }

    &__body {
      padding: 30px 40px;
    }

    &__footer {
      border-top: 1px solid #dee2e6;
      padding: 16px;
      justify-content: flex-end;
    }
  }

  .dialog-footer /deep/ button.el-button {
    font-size: 13px;
    padding: 10px 20px;
  }
</style>
