<template>
  <el-dialog
    :title="title"
    :top="top"
    :width="iWidth"
    class="dialog"
    v-bind="$attrs"
    append-to-body
    v-on="$listeners"
  >
    <slot />
    <div slot="footer" class="dialog-footer">
      <slot name="footer">
        <el-button v-if="showCancel" size="small" @click="onCancel">{{ cancelTitle }}</el-button>
        <el-button v-if="showConfirm" type="primary" size="small" :loading="loadingStatus" @click="onConfirm">{{ confirmTitle }}</el-button>
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
    }
  },
  data() {
    return {
    }
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
  .dialog >>> .el-dialog__header {
    /*padding-top: 10px;*/
  }

  .dialog-footer {
    padding-right: 20px;
  }

</style>
