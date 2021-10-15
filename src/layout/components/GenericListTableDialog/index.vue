<template>
  <Dialog
    :title="title"
    :visible.sync="iVisible"
    top="1vh"
    :width="width"
    :show-cancel="false"
    :show-confirm="false"
  >
    <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import { GenericListTable } from '@/layout/components'

export default {
  name: 'Index',
  components: {
    Dialog, GenericListTable
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

<style scoped>

</style>
