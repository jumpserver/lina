<template>
  <div>
    <ExportDialog :selected-rows="selectedRows" :url="url" v-bind="$attrs" v-on="$listeners" />
    <ImportDialog :selected-rows="selectedRows" :url="url" v-bind="$attrs" v-on="$listeners" />
  </div>
</template>

<script>
import ExportDialog from './ExportDialog'
import ImportDialog from './ImportDialog'

export default {
  name: 'DialogAction',
  components: {
    ExportDialog,
    ImportDialog
  },
  props: {
    selectedRows: {
      type: Array,
      default: () => []
    },
    url: {
      type: String,
      default: () => ''
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
