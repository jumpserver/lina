<template>
  <el-dialog :title="title" v-bind="$attrs" v-on="$listeners">
    <slot></slot>
    <div slot="footer" class="dialog-footer">
      <slog name="footer">
        <el-button size="small" @click="onCancel">{{ $t('Cancel') }}</el-button>
        <el-button type="primary" size="small" @click="onConfirm">{{ $tc('Ok') }}</el-button>
      </slog>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'Dialog',
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: false
    }
  },
  methods: {
    onCancel() {

    },
    onConfirm() {

    }
  }
}
</script>

<style scoped>

</style>
