<template>
  <div>
    <el-row :gutter="20">
      <el-col :md="24" :sm="24">
        <el-alert type="success">
          {{ $t('terminal.AppletHelpText') }}
        </el-alert>
      </el-col>
    </el-row>
    <CardTable ref="CardTable" v-bind="$data" />
    <UploadDialog :visible.sync="uploadDialogVisible" @upload-event="handleUpload" />
  </div>
</template>

<script>
import CardTable from './components/CardTable'
import UploadDialog from './UploadDialog'

export default {
  name: 'Applets',
  components: {
    CardTable,
    UploadDialog
  },
  data() {
    return {
      uploadDialogVisible: false,
      tableConfig: {
        url: '/api/v1/terminal/applets/',
        deletePerm: 'terminal.delete_applet'
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
        extraActions: [
          {
            title: this.$t('terminal.Marketplace'),
            icon: 'el-icon-shopping-bag-1',
            callback: () => {
              window.open('https://apps.fit2cloud.com/jumpserver')
            }
          }
        ],
        detailRoute: 'AppletDetail',
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
