<template>
  <Dialog
    :title="$t('common.Import')"
    :visible.sync="showImportDialog"
    :destroy-on-close="true"
    :loading-status="loadStatus"
    width="80%"
    @confirm="handleImportConfirm"
    @cancel="handleImportCancel()"
  >
    <el-form label-position="left" style="padding-left: 50px">
      <el-form-item :label="$t('common.Import' )" :label-width="'100px'">
        <el-radio v-model="importOption" class="export-item" label="1">{{ this.$t('common.Create') }}</el-radio>
        <el-radio v-model="importOption" class="export-item" label="2">{{ this.$t('common.Update') }}</el-radio>
        <div style="line-height: 1.5">
          <span class="el-upload__tip">
            {{ downloadTemplateTitle }}
            <el-link type="success" :underline="false" :href="getDownloadTemplateUrl('csv')" style="padding-left: 10px"> CSV </el-link>
            <el-link type="success" :underline="false" :href="getDownloadTemplateUrl('xlsx')" style="padding-left: 10px"> XLSX </el-link>
          </span>
        </div>
      </el-form-item>
      <el-form-item v-if="!showTable" :label="$t('common.Upload' )" :label-width="'100px'" class="file-uploader">
        <el-upload
          ref="upload"
          drag
          action="string"
          list-type="text/csv"
          :limit="1"
          :auto-upload="false"
          :on-change="onFileChange"
          accept=".csv,.xlsx"
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
        </el-upload>
      </el-form-item>
      <div v-else>
        <DataTable :config="tableConfig" class="importTable" />
      </div>
    </el-form>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
// import { createSourceIdCache } from '@/api/common'
import DataTable from '@/components/DataTable'

export default {
  name: 'ImportDialog',
  components: {
    Dialog,
    DataTable
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
      showImportDialog: false,
      importOption: '1',
      errorMsg: '',
      loadStatus: false,
      importTypeOption: 'csv',
      importTypeIsCsv: true,
      showTable: false,
      tableConfig: {
        paginationSizes: [10],
        paginationSize: 10,
        hasSelection: false,
        columns: [],
        totalData: []
      }
    }
  },
  computed: {
    hasSelected() {
      return this.selectedRows.length > 0
    },
    upLoadUrl() {
      return this.url
    },
    uploadHelpTextClass() {
      const cls = ['el-upload__tip']
      if (!this.isCsv) {
        cls.push('error-msg')
      }
      return cls
    },
    downloadTemplateTitle() {
      if (this.importOption === '1') {
        return this.$t('common.imExport.downloadImportTemplateMsg')
      } else {
        return this.$t('common.imExport.downloadUpdateTemplateMsg')
      }
    }
  },
  watch: {
    importOption(val) {
      this.showTable = false
    }
  },
  mounted() {
    this.$eventBus.$on('showImportDialog', (row) => {
      this.showImportDialog = true
    })
  },
  methods: {
    onFileChange(file, fileList) {
      if (file.status !== 'ready') {
        return
      }
      // const isCsv = file.raw.type = 'text/csv'
      const isCsv = file.name.indexOf('csv') > -1
      this.tableConfig.columns = []
      this.$axios.post(
        this.upLoadUrl + 'render-to-json/',
        file.raw,
        { headers: { 'Content-Type': isCsv ? 'text/csv' : 'text/xlsx' }, disableFlashErrorMsg: true }
      ).then((data) => {
        const tableTitle = data['title']
        const tableData = data['data']
        this.tableConfig.columns.push({
          prop: 'success',
          label: '状态',
          width: '80px',
          fixed: true
        })
        tableTitle.forEach(item => {
          this.tableConfig.columns.push({
            prop: item[1],
            label: item[0],
            minWidth: '100px',
            showOverflowTooltip: true
          })
        })
        this.showTable = true
        console.log(tableData)
        this.tableConfig.totalData = []
        setTimeout(() => {
          tableData.forEach((item, index) => {
            item.id = index
            item.success = ''
          })
          this.tableConfig.totalData = tableData
        }, 300)
      }).catch(error => {
        console.log(error)
      }).finally(() => {
        this.loadStatus = false
      })
    },
    getDownloadTemplateUrl(tp) {
      const template = this.importOption === '1' ? 'import' : 'update'
      const query = tp === 'csv' ? `format=csv&template=${template}&limit=1` : `format=xlsx&template=${template}&limit=1`
      return (this.url.indexOf('?') === -1) ? `${this.url}?${query}` : `${this.url}&${query}`
    },
    performUpdate() {
      this.tableConfig.totalData.forEach(item => {
        this.$axios.put(
          this.upLoadUrl,
          item,
          { disableFlashErrorMsg: true }
        ).then((data) => {
          const msg = this.$t('common.imExport.updateSuccessMsg', { count: data.length })
          this.onSuccess(msg)
        }).catch(error => {
          this.catchError(error)
        }).finally(() => {
          this.loadStatus = false
        })
      })
    },
    performCreate() {
      this.tableConfig.totalData.forEach(item => {
        this.$axios.post(
          this.upLoadUrl,
          item,
          { disableFlashErrorMsg: true }
        ).then((data) => {
          item.id = data['id']
          item.FALSE = 'TRUE'
        }).catch(error => {
          item.FALSE = 'FALSE'
          console.log(error)
        }).finally(() => {
          this.loadStatus = false
        })
      })
    },
    catchError(error) {
      console.log(error)
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
      if (this.importOption === '1') {
        this.performCreate()
      } else {
        this.performUpdate()
      }
    },
    handleImportCancel() {
      this.showImportDialog = false
      this.showTable = false
      this.tableConfig.columns = []
      this.tableConfig.totalData = []
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
  .file-uploader >>> .el-upload-dragger, .file-uploader >>> .el-upload {
    width: 100%;
    padding-right: 150px;
  }

  .importTable {
    padding-right: 50px;
    overflow: auto;
  }

</style>
