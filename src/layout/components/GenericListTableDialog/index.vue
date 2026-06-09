<template>
  <Dialog
    v-model:visible="iVisible"
    :title="title"
    :width="width"
    :show-cancel="false"
    :show-confirm="false"
    top="1vh"
  >
    <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import { GenericListTable } from '@/layout/components'
import { useVModel } from '@/utils/vue/useVModel'

export default {
  name: 'Index',
  components: {
    Dialog,
    GenericListTable
  },
  props: {
    title: {
      type: String,
      required: true
    },
    visible: {
      type: Boolean,
      default: false
    },
    tableConfig: {
      type: Object,
      default: () => ({})
    },
    headerActions: {
      type: Object,
      default: () => ({})
    },
    width: {
      type: String,
      default: '60%'
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
