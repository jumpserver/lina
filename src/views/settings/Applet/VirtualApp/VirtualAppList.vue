<template>
  <div>
    <CardTable v-bind="$data" ref="CardTable" />
    <UploadDialog v-model:visible="uploadDialogVisible" @upload-event="handleUpload" />
  </div>
</template>

<script>
import CardTable from '@/components/Table/CardTable'
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
          this.$router.push({ name: 'VirtualAppCreate' })
        },
        createTitle: this.$t('Create'),
        extraActions: [
          {
            name: 'UploadVirtualApp',
            title: this.$t('Upload'),
            icon: 'fa fa-upload',
            callback: () => {
              this.uploadDialogVisible = true
            }
          }
        ],
        searchConfig: {
          getUrlQuery: false
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
