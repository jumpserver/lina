<template>
  <el-dialog
    :title="title"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot />
    <div slot="footer" class="dialog-footer">
      <slot name="footer">
        <el-button v-if="showCancel" size="small" @click="onCancel">{{ cancelTitle }}</el-button>
        <el-button v-if="showConfirm" type="primary" size="small" @click="onConfirm">{{ confirmTitle }}</el-button>
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
    showConfirm: {
      type: Boolean,
      default: true
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

<style scoped>

</style>
