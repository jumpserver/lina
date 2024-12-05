<template>
  <Dialog :title="$tc('ResolveSelected')" :visible.sync="iVisible">
    <div>
      Hello
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'

export default {
  name: 'BatchResolveDialog',
  components: { Dialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    selected: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {

    }
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

</style>
