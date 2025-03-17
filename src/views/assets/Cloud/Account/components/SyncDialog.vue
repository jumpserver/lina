<template>
  <Dialog
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
    :show-buttons="false"
    :title="$tc('SyncOnline')"
    :visible.sync="iVisible"
    v-on="$listeners"
  >
    <AssetPanel :object="object" :visible.sync="iVisible" />
  </Dialog>
</template>

<script>
import AssetPanel from '@/views/assets/Cloud/Account/components/AssetPanel.vue'
import Dialog from '@/components/Dialog/index.vue'

export default {
  name: 'SyncDialog',
  components: { Dialog, AssetPanel },
  props: {
    object: {
      type: Object,
      default: () => ({})
    },
    visible: {
      type: Boolean,
      default: () => false
    }
  },
  computed: {
    iVisible: {
      set(val) {
        this.$emit('update:visible', val)
      },
      get() {
        return this.visible
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
