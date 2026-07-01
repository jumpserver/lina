<template>
  <div>
    <ExportDialog v-bind="{ ...$attrs, ...exportOptions }" :selected-rows="selectedRows" />
    <ImportDialog v-bind="{ ...$attrs, ...importOptions }" :selected-rows="selectedRows" />
  </div>
</template>

<script>
import ExportDialog from './ExportDialog.vue'
import ImportDialog from './ImportDialog.vue'

export default {
  name: 'ImExportDialog',
  components: {
    ExportDialog,
    ImportDialog
  },
  props: {
    selectedRows: {
      type: Array,
      default: () => []
    },
    exportOptions: {
      type: Object,
      default: () => ({})
    },
    importOptions: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {}
  }
}
</script>
