<template>
  <div>
    <ExportDialog :selected-rows="selectedRows" v-bind="exportOptions" v-on="$listeners" />
    <ImportDialog :selected-rows="selectedRows" v-bind="importOptions" :reload-table="reloadTable" v-on="$listeners" />
  </div>
</template>

<script>
import ExportDialog from './ExportDialog'
import ImportDialog from './ImportDialog'

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
    },
    reloadTable: {
      type: Function,
      default: () => {}
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
