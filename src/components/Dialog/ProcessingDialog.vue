<template>
  <Dialog
    :visible="iVisible"
    title="Processing"
    width="300"
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
  data() {
    return {}
  },
  computed: {
    iVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.spinner {
    width: 50px;
    height: 50px;
    border: 5px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: #3498db;
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
