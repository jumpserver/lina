<template>
  <el-dialog
    :title="title"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot />
    <div slot="footer" class="dialog-footer">
      <slot name="footer">
        <el-button size="small" @click="onCancel">{{ $tc('Cancel') }}</el-button>
        <el-button type="primary" size="small" @click="onConfirm">{{ $tc('Confirm') }}</el-button>
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
