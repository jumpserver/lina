<template>
  <Dialog
    :show-cancel="false"
    :visible="visible"
    class="processing-dialog"
    height="300"
    :title="$tc('Processing')"
    width="300"
    @update:visible="$emit('update:visible', $event)"
    @confirm="$emit('update:visible', false)"
  >
    <div id="load">
      <div class="spinner" />
    </div>
  </Dialog>
</template>

<script>
import Dialog from './index.vue'

export default {
  name: 'ProcessingDialog',
  components: { Dialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:visible'],
  data() {
    return {}
  }
}
</script>

<style lang="scss" scoped>
.processing-dialog {
  :deep(.el-dialog__body) {
    overflow: hidden;
  }
}

.spinner {
  width: 100px;
  height: 100px;
  border: 5px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--color-primary);
  animation: spin 1s infinite linear;
}

#load {
  display: flex;
  justify-content: center;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
