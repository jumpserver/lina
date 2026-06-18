<template>
  <Dialog
    v-model:visible="iVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
    :show-buttons="false"
    :title="$tc('SyncOnline')"
  >
    <AssetPanel v-model:visible="iVisible" :object="object" />
  </Dialog>
</template>

<script>
import AssetPanel from '@/views/assets/Cloud/Account/components/AssetPanel.vue'
import Dialog from '@/components/Dialog/index.vue'
import { useVModel } from '@/utils/vue/useVModel'

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
  emits: ['update:visible'],
  setup(props, { emit }) {
    const iVisible = useVModel(props, emit, 'visible')
    return {
      iVisible
    }
  }
}
</script>

<style lang="scss" scoped></style>
