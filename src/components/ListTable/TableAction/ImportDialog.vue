<template>
  <Dialog
    :title="importTitle"
    :visible.sync="showImportDialog"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    :loading-status="loadStatus"
    width="80%"
    class="importDialog"
    :show-cancel="false"
    :show-confirm="false"
    @close="handleImportCancel"
  >
    <el-form v-if="!showTable" label-position="left" style="padding-left: 50px">
      <el-form-item :label="$t('common.Import' )" :label-width="'100px'">
        <el-radio v-if="canImportCreate" v-model="importOption" class="export-item" label="create">
          {{ this.$t('common.Create') }}
        </el-radio>
        <el-radio v-if="canImportUpdate" v-model="importOption" class="export-item" label="update">
          {{ this.$t('common.Update') }}
        </el-radio>
        <div style="line-height: 1.5">
          <span class="el-upload__tip">
            {{ downloadTemplateTitle }}
            <el-link type="success" :underline="false" style="padding-left: 10px" @click="downloadTemplateFile('csv')"> CSV </el-link>
            <el-link type="success" :underline="false" style="padding-left: 10px" @click="downloadTemplateFile('xlsx')"> XLSX </el-link>
          </span>
        </div>
      </el-form-item>
      <el-form-item :label="$t('common.Upload' )" :label-width="'100px'" class="file-uploader">
        <el-upload
          ref="upload"
          drag
          action="string"
          list-type="text/csv"
          :limit="1"
          :auto-upload="false"
          :on-change="onFileChange"
          :before-upload="beforeUpload"
          accept=".csv,.xlsx"
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">{{ $t('common.imExport.dragUploadFileInfo') }}</div>
          <div slot="tip" class="el-upload__tip">
            <span :class="{'hasError': hasFileFormatOrSizeError }">{{ $t('common.imExport.uploadCsvLth10MHelpText') }}</span>
            <div v-if="renderError" class="hasError">{{ renderError }}</div>
          </div>
        </el-upload>
      </el-form-item>
    </el-form>
    <div v-else class="importTableZone">
      <ImportTable
        ref="importTable"
        :json-data="jsonData"
        :import-option="importOption"
        :url="url"
        @cancel="cancelUpload"
        @finish="closeDialog"
      />
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import ImportTable from '@/components/ListTable/TableAction/ImportTable'
import { getErrorResponseMsg } from '@/utils/common'
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
      type: Boolean,
      default: false
    },
    canImportUpdate: {
      type: Boolean,
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
        { headers: { 'Content-Type': isCsv ? 'text/csv' : 'text/xlsx' }, disableFlashErrorMsg: true }
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
      let query = `format=${tp}&template=${template}`
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
    // eslint-disable-next-line handle-callback-err
    catchError(error) {
      // debug(error)
    },
    onSuccess(msg) {
      this.errorMsg = ''
      this.$message.success(msg)
    },
    downloadCsv(url) {
      const a = document.createElement('a')
      a.href = url
      a.click()
      window.URL.revokeObjectURL(url)
    },
    async handleImportConfirm() {
      this.$refs['importTable'].performUpload()
    },
    handleImportCancel() {
      this.showImportDialog = false
      this.showTable = false
      this.renderError = ''
      this.jsonData = {}
    }
  }
}
</script>

<style lang='scss' scoped>
  @import "~@/styles/element-variables.scss";
  .error-msg {
    color: $--color-danger;
  }
  .error-msg.error-results {
    background-color: #f3f3f4;
    max-height: 200px;
    overflow: auto
  }

  .importDialog >>> .el-form-item.file-uploader {
    padding-right: 150px;
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
  }
</style>
