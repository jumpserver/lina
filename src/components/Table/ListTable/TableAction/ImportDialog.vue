<template>
  <Dialog
    :close-on-click-modal="false"
    :destroy-on-close="true"
    :loading-status="loadStatus"
    :show-cancel="false"
    :show-confirm="false"
    :title="importTitle"
    :visible.sync="showImportDialog"
    class="importDialog"
    width="900px"
    @close="handleImportCancel"
  >
    <el-form v-if="!showTable" label-position="left" style="padding-left: 20px">
      <el-form-item :label="$tc('common.Import' )" :label-width="'100px'">
        <el-radio v-if="canImportCreate" v-model="importOption" class="export-item" label="create">
          {{ this.$t('common.Create') }}
        </el-radio>
        <el-radio v-if="canImportUpdate" v-model="importOption" class="export-item" label="update">
          {{ this.$t('common.Update') }}
        </el-radio>
        <div style="line-height: 1.5">
          <span class="el-upload__tip">
            {{ downloadTemplateTitle }}
            <el-link type="success" @click="downloadTemplateFile('csv')"> CSV </el-link>
            <el-link type="success" @click="downloadTemplateFile('xlsx')"> XLSX </el-link>
          </span>
        </div>
      </el-form-item>
      <el-form-item :label="$tc('common.Upload' )" :label-width="'100px'" class="file-uploader">
        <el-upload
          ref="upload"
          :auto-upload="false"
          :before-upload="beforeUpload"
          :limit="1"
          :on-change="onFileChange"
          accept=".csv,.xlsx"
          action="string"
          drag
          list-type="text/csv"
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">
            {{ $t('common.imExport.dragUploadFileInfo') }}
          </div>
          <div slot="tip" class="el-upload__tip">
            <span :class="{'hasError': hasFileFormatOrSizeError }">
              {{ $t('common.imExport.uploadCsvLth10MHelpText') }}
            </span>
            <div v-if="renderError" class="hasError">{{ renderError }}</div>
          </div>
        </el-upload>
      </el-form-item>
    </el-form>
    <div v-else class="importTableZone">
      <ImportTable
        ref="importTable"
        :import-option="importOption"
        :json-data="jsonData"
        :url="url"
        @cancel="cancelUpload"
        @finish="closeDialog"
      />
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import ImportTable from '@/components/Table/ListTable/TableAction/ImportTable.vue'
import { download, getErrorResponseMsg } from '@/utils/common'
import { createSourceIdCache } from '@/api/common'

export default {
  name: 'ImportDialog',
  components: {
    Dialog,
    ImportTable
  },
  props: {
    selectedRows: {
      type: Array,
      default: () => []
    },
    url: {
      type: String,
      default: () => ''
    },
    canImportCreate: {
      type: [Boolean, Function],
      default: false
    },
    canImportUpdate: {
      type: [Boolean, Function],
      default: false
    }
  },
  data() {
    return {
      showImportDialog: false,
      importOption: this.canImportCreate && this.canImportUpdate ? 'create' : this.canImportCreate ? 'create' : 'update',
      errorMsg: '',
      loadStatus: false,
      importTypeOption: 'csv',
      importTypeIsCsv: true,
      showTable: false,
      renderError: '',
      hasFileFormatOrSizeError: false,
      jsonData: {}
    }
  },
  computed: {
    hasSelected() {
      return this.selectedRows.length > 0
    },
    uploadHelpTextClass() {
      const cls = ['el-upload__tip']
      if (!this.isCsv) {
        cls.push('error-msg')
      }
      return cls
    },
    downloadTemplateTitle() {
      if (this.importOption === 'create') {
        return this.$t('common.imExport.downloadImportTemplateMsg')
      } else {
        return this.$t('common.imExport.downloadUpdateTemplateMsg')
      }
    },
    importTitle() {
      if (this.importOption === 'create') {
        return this.$t('common.Import') + this.$t('common.Create')
      } else {
        return this.$t('common.Import') + this.$t('common.Update')
      }
    }
  },
  watch: {
    importOption(val) {
      this.showTable = false
    }
  },
  mounted() {
    this.$eventBus.$on('showImportDialog', ({ url }) => {
      if (url === this.url) {
        this.showImportDialog = true
      }
    })
  },
  methods: {
    closeDialog() {
      this.showImportDialog = false
    },
    cancelUpload() {
      this.showTable = false
      this.renderError = ''
      this.jsonData = {}
    },
    onFileChange(file, fileList) {
      fileList.splice(0, fileList.length)
      if (file.status !== 'ready') {
        return
      }
      // const isCsv = file.raw.type = 'text/csv'
      if (!this.beforeUpload(file)) {
        return
      }
      const isCsv = file.name.indexOf('csv') > -1
      const url = new URL(this.url, 'http://localhost')
      url.pathname += 'render-to-json/'
      const renderToJsonUrl = url.toString().replace('http://localhost', '')
      this.$axios.post(
        renderToJsonUrl,
        file.raw,
        {
          headers: { 'Content-Type': isCsv ? 'text/csv' : 'text/xlsx' },
          disableFlashErrorMsg: true
        }
      ).then(data => {
        this.jsonData = data
        this.showTable = true
      }).catch(error => {
        fileList.splice(0, fileList.length)
        this.renderError = getErrorResponseMsg(error)
      }).finally(() => {
        this.loadStatus = false
      })
    },
    beforeUpload(file) {
      const isLt30M = file.size / 1024 / 1024 < 30
      if (!isLt30M) {
        this.hasFileFormatOrSizeError = true
      }
      return isLt30M
    },
    async downloadTemplateFile(tp) {
      const downloadUrl = await this.getDownloadTemplateUrl(tp)
      window.open(downloadUrl)
    },
    async getDownloadTemplateUrl(tp) {
      const template = this.importOption === 'create' ? 'import' : 'update'
      const action = this.importOption === 'create' ? 'create' : 'partial_update'
      let query = `format=${tp}&template=${template}&action=${action}`
      if (this.importOption === 'update' && this.selectedRows.length > 0) {
        const resources = []
        for (const item of this.selectedRows) {
          resources.push(item.id)
        }
        const resp = await createSourceIdCache(resources)
        query += `&spm=${resp.spm}`
      } else {
        query += '&limit=1'
      }
      return this.url.indexOf('?') === -1 ? `${this.url}?${query}` : `${this.url}&${query}`
    },
    catchError(err) {
      this.$log.error(err)
    },
    onSuccess(msg) {
      this.errorMsg = ''
      this.$message.success(msg)
    },
    downloadCsv(url) {
      download(url)
    },
    async handleImportConfirm() {
      await this.$refs['importTable'].performUpload()
    },
    handleImportCancel() {
      this.showImportDialog = false
      this.showTable = false
      this.renderError = ''
      this.jsonData = {}
      this.$emit('importDialogClose')
    }
  }
}
</script>

<style lang='scss' scoped>
  @import "~@/styles/variables";
  .error-msg {
    color: $--color-danger;
  }
  .error-msg.error-results {
    background-color: #f3f3f4;
    max-height: 200px;
    overflow: auto
  }

  .file-uploader >>> .el-upload {
    width: 100%;
    //padding-right: 150px;
  }

  .file-uploader >>> .el-upload-dragger {
    width: 100%;
  }

  .importTableZone {
    padding: 0 20px;

    .importTable {
      overflow: auto;
    }

    .tableFilter {
      padding-bottom: 10px;
    }
  }

  .importTable >>> .el-dialog__body {
    padding-bottom: 20px;
  }

  .export-item {
    margin-left: 80px;
  }

  .export-item:first-child {
    margin-left: 0;
  }

  .hasError {
    color: $--color-danger;
  }

  .el-upload__tip {
    line-height: 1.5;
    padding-top: 0;

    .el-link {
      margin-left: 10px;
    }
  }
</style>
