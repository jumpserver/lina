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
import vModelMixin from '@/utils/vue/vModelMixin'

export default {
  name: 'Index',
  components: {
    Dialog,
    GenericListTable
  },
  mixins: [vModelMixin('visible')],
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
  emits: ['update:visible']
}
</script>
