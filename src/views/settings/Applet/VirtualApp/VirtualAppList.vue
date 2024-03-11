<template>
  <div>
    <CardTable ref="CardTable" v-bind="$data" />
    <UploadDialog :visible.sync="uploadDialogVisible" @upload-event="handleUpload" />
  </div>
</template>

<script>
import CardTable from './components/CardTable'
import UploadDialog from './UploadDialog'

export default {
  name: 'VirtualApp',
  components: {
    CardTable,
    UploadDialog
  },
  data() {
    return {
      uploadDialogVisible: false,
      tableConfig: {
        url: '/api/v1/terminal/virtual-apps/',
        deletePerm: 'terminal.delete_virtualapp'
      },
      headerActions: {
        onCreate: () => {
          this.uploadDialogVisible = true
        },
        createTitle: this.$t('common.Upload'),
        searchConfig: {
          getUrlQuery: false,
          exclude: ['version']
        },
        detailRoute: 'VirtualAppDetail',
        hasExport: false,
        hasImport: false,
        hasBulkDelete: false,
        hasBulkUpdate: false,
        hasColumnSetting: false
      }
    }
  },
  methods: {
    handleUpload(res) {
      this.$refs.CardTable.reloadTable()
    }
  }
}
</script>

<style lang="scss" scoped>
.dom {
  white-space: initial;

  .el-tag {
    margin-right: 3px;
  }
}
</style>
