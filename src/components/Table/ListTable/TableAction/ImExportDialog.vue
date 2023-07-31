<template>
  <div>
    <ExportDialog :selected-rows="selectedRows" v-bind="exportOptions" v-on="$listeners" />
    <ImportDialog :selected-rows="selectedRows" v-bind="importOptions" v-on="$listeners" />
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
    return {
    }
  }
}
</script>

<style lang='less' scoped>

</style>
