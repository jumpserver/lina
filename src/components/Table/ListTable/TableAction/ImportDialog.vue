<template>
  <Dialog
    v-model:visible="showImportDialog"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    :disabled-status="loadStatus"
    :show-cancel="!showTable || isPackageMode"
    :show-confirm="isPackageMode"
    :cancel-title="$tc('Cancel')"
    :confirm-title="packageConfirmTitle"
    :title="dialogTitle"
    class="importDialog"
    width="900px"
    @cancel="handleImportCancel"
    @close="handleImportCancel"
    @confirm="handlePackageConfirm"
  >
    <el-form v-if="!showTable" class="import-form" label-position="left">
      <el-form-item :label="$tc('Import')" :label-width="'100px'" class="import-option">
        <el-radio v-if="canImportCreate" v-model="importOption" class="export-item" value="create">
          {{ $t('Create') }}
        </el-radio>
        <el-radio v-if="canImportUpdate" v-model="importOption" class="export-item" value="update">
          {{ $t('Update') }}
        </el-radio>
        <el-radio
          v-if="canImportPackage"
          v-model="importOption"
          class="export-item"
          value="package"
        >
          {{ importPackageLabel }}
        </el-radio>
        <span v-if="!isPackageMode" class="el-upload__tip download-tpl">
          {{ downloadTemplateTitle }}
          <el-link type="primary" @click="downloadTemplateFile('csv')"> CSV </el-link>
          <el-link type="primary" @click="downloadTemplateFile('xlsx')"> XLSX </el-link>
        </span>
      </el-form-item>
      <template v-if="!isPackageMode">
        <el-form-item :label="$tc('Upload')" :label-width="'100px'" class="file-uploader">
          <el-upload
            ref="upload"
            :auto-upload="false"
            :before-upload="beforeTableUpload"
            :limit="1"
            :on-change="onFileChange"
            accept=".csv,.xlsx"
            action="string"
            drag
            list-type="text"
          >
            <el-icon><Upload /></el-icon>
            <div class="el-upload__text">
              {{ $t('DragUploadFileInfo') }}
            </div>
            <template #tip>
              <div class="el-upload__tip">
                <span :class="{ hasError: hasFileFormatOrSizeError }">
                  {{ $t('UploadCsvLth10MHelpText') }}
                </span>
                <div v-if="renderError" class="hasError">{{ renderError }}</div>
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </template>
      <template v-else>
        <el-form-item :label="$tc('Upload')" :label-width="'100px'" class="file-uploader">
          <el-upload
            ref="upload"
            :auto-upload="false"
            :before-upload="beforePackageUpload"
            :limit="1"
            :on-change="onPackageFileChange"
            :accept="packageUploadAccept"
            action="string"
            drag
            list-type="text"
          >
            <el-icon><Upload /></el-icon>
            <div class="el-upload__text">
              {{ $t('DragUploadFileInfo') }}
            </div>
            <template #tip>
              <div class="el-upload__tip">
                <span :class="{ hasError: hasFileFormatOrSizeError }">
                  {{ packageTipText }}
                </span>
                <div v-if="renderError" class="hasError">{{ renderError }}</div>
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </template>
    </el-form>
    <div v-else class="importTableZone">
      <ImportTable
        v-bind="$attrs"
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
import { createSourceIdCache } from '@/api/common'
import Dialog from '@/components/Dialog/index.vue'
import ImportTable from '@/components/Table/ListTable/TableAction/ImportTable.vue'
import { download, getErrorResponseMsg } from '@/utils/common/index'

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
      type: [Boolean, Function, String],
      default: false
    },
    canImportUpdate: {
      type: [Boolean, Function, String],
      default: false
    },
    canImportPackage: {
      type: [Boolean, Function, String],
      default: false
    },
    importPackageLabel: {
      type: String,
      default: 'Package'
    },
    packageUploadUrl: {
      type: String,
      default: ''
    },
    packageUploadAccept: {
      type: String,
      default: '.zip'
    },
    packageUploadTip: {
      type: String,
      default: ''
    },
    packageUploadConfirmText: {
      type: String,
      default: 'Upload'
    },
    packageUploadTitle: {
      type: String,
      default: ''
    },
    packageUploadRequestMethod: {
      type: String,
      default: 'post'
    },
    packageUploadRequestParams: {
      type: Object,
      default: () => ({})
    },
    packageUploadMaxSizeMB: {
      type: Number,
      default: 30
    }
  },
  data() {
    return {
      showImportDialog: false,
      importOption:
        this.canImportCreate && this.canImportUpdate
          ? 'create'
          : this.canImportCreate
            ? 'create'
            : this.canImportPackage
              ? 'package'
              : 'update',
      errorMsg: '',
      loadStatus: false,
      importTypeOption: 'csv',
      importTypeIsCsv: true,
      showTable: false,
      renderError: '',
      hasFileFormatOrSizeError: false,
      jsonData: {},
      uploadFile: null
    }
  },
  computed: {
    isPackageMode() {
      return this.importOption === 'package'
    },
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
        return this.$t('DownloadImportTemplateMsg')
      } else {
        return this.$t('DownloadUpdateTemplateMsg')
      }
    },
    importTitle() {
      if (this.isPackageMode) {
        return this.packageUploadTitle || this.importPackageLabel
      }
      let option = ''
      if (this.importOption === 'create') {
        option = this.$t('Create')
      } else {
        option = this.$t('Update')
      }
      return `${this.$t('Import')} & ${option}`
    },
    dialogTitle() {
      return this.importTitle
    },
    packageConfirmTitle() {
      return this.packageUploadConfirmText || this.$t('Upload')
    },
    packageTipText() {
      return (
        this.packageUploadTip || this.$t('UploadZipTips', { size: this.packageUploadMaxSizeMB })
      )
    }
  },
  watch: {
    importOption(val) {
      this.showTable = false
      this.renderError = ''
      this.jsonData = {}
      this.uploadFile = null
      this.$refs.upload?.clearFiles()
    }
  },
  beforeUnmount() {
    this.$eventBus.$off('showImportDialog', this.showImportEventHandler)
  },
  mounted() {
    this.$eventBus.$on('showImportDialog', this.showImportEventHandler)
  },
  methods: {
    showImportEventHandler(options = {}) {
      const { url } = options
      if (!url || url === this.url) {
        this.showImportDialog = true
      }
    },
    closeDialog() {
      this.showImportDialog = false
      this.$emit('importDialogClose')
    },
    cancelUpload() {
      this.showTable = false
      this.renderError = ''
      this.jsonData = {}
      this.uploadFile = null
      this.$refs.upload?.clearFiles()
    },
    onPackageFileChange(file, fileList) {
      if (file.status !== 'ready') {
        return
      }
      if (!this.beforePackageUpload(file)) {
        fileList.splice(0, fileList.length)
        return
      }
      this.uploadFile = file
    },
    onFileChange(file, fileList) {
      fileList.splice(0, fileList.length)
      if (file.status !== 'ready') {
        return
      }
      // const isCsv = file.raw.type = 'text/csv'
      if (!this.beforeTableUpload(file)) {
        return
      }
      const isCsv = file.name.indexOf('csv') > -1
      const url = new URL(this.url, 'http://localhost')
      url.pathname += 'render-to-json/'
      const renderToJsonUrl = url.toString().replace('http://localhost', '')
      const requestMethod = this.importOption === 'create' ? 'post' : 'put'
      this.$axios({
        url: renderToJsonUrl,
        data: file.raw,
        method: requestMethod,
        headers: { 'Content-Type': isCsv ? 'text/csv' : 'text/xlsx' },
        disableFlashErrorMsg: true
      })
        .then((data) => {
          this.jsonData = data
          this.showTable = true
        })
        .catch((error) => {
          fileList.splice(0, fileList.length)
          this.renderError = getErrorResponseMsg(error)
        })
        .finally(() => {
          this.loadStatus = false
        })
    },
    beforeTableUpload(file) {
      this.hasFileFormatOrSizeError = false
      const isLtSize = file.size / 1024 / 1024 < 10
      if (!isLtSize) {
        this.hasFileFormatOrSizeError = true
      }
      return isLtSize
    },
    beforePackageUpload(file) {
      this.hasFileFormatOrSizeError = false
      const isLtSize = file.size / 1024 / 1024 < this.packageUploadMaxSizeMB
      if (!isLtSize) {
        this.hasFileFormatOrSizeError = true
      }
      return isLtSize
    },
    async handlePackageConfirm() {
      if (!this.uploadFile || !this.packageUploadUrl) {
        return
      }
      this.loadStatus = true
      this.renderError = ''
      const form = new FormData()
      form.append('file', this.uploadFile.raw)
      try {
        const data = await this.$axios({
          url: this.packageUploadUrl,
          data: form,
          method: this.packageUploadRequestMethod,
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60 * 60 * 1000,
          disableFlashErrorMsg: true,
          params: this.packageUploadRequestParams
        })
        this.$message.success(this.$tc('UploadSucceed'))
        this.showImportDialog = false
        this.$emit('importDialogClose')
        this.$emit('upload-event', data)
      } catch (error) {
        this.renderError = getErrorResponseMsg(error)
      } finally {
        this.loadStatus = false
        this.uploadFile = null
        this.$refs.upload?.clearFiles()
      }
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
      this.uploadFile = null
      this.$refs.upload?.clearFiles()
      this.$emit('importDialogClose')
    }
  }
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.error-msg {
  color: $color-danger;
}

.error-msg.error-results {
  background-color: #f3f3f4;
  max-height: 200px;
  overflow: auto;
}

.file-uploader :deep(.el-form-item__content) {
  display: block;
}

.file-uploader :deep(.el-upload),
.file-uploader :deep(.el-upload-dragger) {
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

.importTable :deep(.el-dialog__body) {
  padding-bottom: 20px;
}

.import-form {
  padding: 0 30px 0 20px;
}

// 导入选项行用 flex：创建/更新单选项 + 下载模板链接一行内均匀排列、垂直居中、可换行
.import-option :deep(.el-form-item__content) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0px 120px;
}

.export-item {
  margin: 0;
}

// 下载模板提示单独占一行，展示在「创建/更新」单选项下方；
// 用 flex + align-items:center 让文字(17)与 el-link(21) 垂直居中对齐，字号统一 13px
.download-tpl {
  flex-basis: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  line-height: 1.5;

  :deep(.el-link) {
    margin-left: 0;
    font-size: 13px;
    vertical-align: middle;
  }
}

.hasError {
  color: $color-danger;
}

.el-upload__tip {
  line-height: 1.5;
  padding-top: 0;
}
</style>
