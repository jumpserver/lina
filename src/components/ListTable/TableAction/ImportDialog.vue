<template>
  <Dialog
    :title="$t('common.Import')"
    :visible.sync="showImportDialog"
    :destroy-on-close="true"
    :loading-status="loadStatus"
    @confirm="handleImportConfirm"
    @cancel="handleImportCancel()"
  >
    <el-form label-position="left" style="padding-left: 50px">
      <el-form-item :label="$t('common.fileType' )" :label-width="'100px'">
        <el-radio-group v-model="importTypeOption">
          <el-radio v-for="option of importTypeOptions" :key="option.value" class="export-item" :label="option.value" :disabled="!option.can">{{ option.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="$t('common.Import' )" :label-width="'100px'">
        <el-radio v-model="importOption" class="export-item" label="1">{{ this.$t('common.Create') }}</el-radio>
        <el-radio v-model="importOption" class="export-item" label="2">{{ this.$t('common.Update') }}</el-radio>
        <div style="line-height: 1.5">
          <span v-if="importOption==='1'" class="el-upload__tip">
            {{ this.$t('common.imExport.downloadImportTemplateMsg') }}
            <el-link type="success" :underline="false" :href="downloadImportTempUrl">{{ this.$t('common.Download') }}</el-link>
          </span>
          <span v-else class="el-upload__tip">
            {{ this.$t('common.imExport.downloadUpdateTemplateMsg') }}
            <el-link type="success" :underline="false" @click="downloadUpdateTempUrl">{{ this.$t('common.Download') }}</el-link>
          </span>
        </div>
      </el-form-item>
      <el-form-item :label="$t('common.Upload' )" :label-width="'100px'">
        <el-upload
          ref="upload"
          action="string"
          list-type="text/csv"
          :http-request="handleImport"
          :limit="1"
          :auto-upload="false"
          :before-upload="beforeUpload"
        >
          <el-button size="mini" type="default">{{ this.$t('common.SelectFile') }}</el-button>
          <!--          <div slot="tip" :class="uploadHelpTextClass" style="line-height: 1.5">{{ this.$t('common.imExport.onlyCSVFilesTips') }}</div>-->
        </el-upload>
      </el-form-item>
    </el-form>
    <div v-if="errorMsg" class="error-msg error-results">
      <ul v-if="typeof errorMsg === 'object'">
        <li v-for="(item, index) in errorMsg" :key="item + '-' + index"> {{ item }}</li>
      </ul>
      <span v-else>{{ errorMsg }}</span>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import { createSourceIdCache } from '@/api/common'

export default {
  name: 'ImportDialog',
  components: {
    Dialog
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
      isCsv: true,
      errorMsg: '',
      loadStatus: false,
      importTypeOption: 'csv'
    }
  },
  computed: {
    hasSelected() {
      return this.selectedRows.length > 0
    },
    importTypeOptions() {
      return [
        {
          label: 'CSV',
          value: 'csv',
          can: true
        },
        {
          label: 'Excel',
          value: 'xlsx',
          can: true
        }
      ]
    },
    upLoadUrl() {
      return this.url
    },
    downloadImportTempUrl() {
      const format = this.importTypeOption === 'csv' ? 'format=csv&template=import&limit=1' : 'format=xlsx&template=import&limit=1'
      const url = (this.url.indexOf('?') === -1) ? `${this.url}?${format}` : `${this.url}&${format}`
      return url
    },
    uploadHelpTextClass() {
      const cls = ['el-upload__tip']
      if (!this.isCsv) {
        cls.push('error-msg')
      }
      return cls
    }
  },
  mounted() {
    this.$eventBus.$on('showImportDialog', (row) => {
      this.showImportDialog = true
    })
  },
  methods: {
    performUpdate(item) {
      this.$axios.put(
        this.upLoadUrl,
        item.file,
        { headers: { 'Content-Type': this.importTypeOption === 'csv' ? 'text/csv' : 'text/xlsx' }, disableFlashErrorMsg: true }
      ).then((data) => {
        const msg = this.$t('common.imExport.updateSuccessMsg', { count: data.length })
        this.onSuccess(msg)
      }).catch(error => {
        this.catchError(error)
      }).finally(() => {
        this.loadStatus = false
      })
    },
    performCreate(item) {
      this.$axios.post(
        this.upLoadUrl,
        item.file,
        { headers: { 'Content-Type': this.importTypeOption === 'csv' ? 'text/csv' : 'text/xlsx' }, disableFlashErrorMsg: true }
      ).then((data) => {
        const msg = this.$t('common.imExport.createSuccessMsg', { count: data.length })
        this.onSuccess(msg)
      }).catch(error => {
        this.catchError(error)
      }).finally(() => {
        this.loadStatus = false
      })
    },
    catchError(error) {
      this.$refs.upload.clearFiles()
      if (error.response && error.response.status === 400) {
        const errorData = error.response.data
        const totalErrorMsg = []
        errorData.forEach((value, index) => {
          if (typeof value === 'string') {
            totalErrorMsg.push(`line ${index}. ${value}`)
          } else {
            const errorMsg = [`line ${index}. `]
            for (const [k, v] of Object.entries(value)) {
              if (v) {
                errorMsg.push(`${k}: ${v}`)
              }
            }
            if (errorMsg.length > 1) {
              totalErrorMsg.push(errorMsg.join(' '))
            }
          }
        })
        this.errorMsg = totalErrorMsg
      }
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
    handleImport(item) {
      this.loadStatus = true
      if (this.importOption === '1') {
        this.performCreate(item)
      } else {
        this.performUpdate(item)
      }
    },
    async downloadUpdateTempUrl() {
      var resources = []
      const data = this.selectedRows
      for (let index = 0; index < data.length; index++) {
        resources.push(data[index].id)
      }
      const spm = await createSourceIdCache(resources)
      const baseUrl = (process.env.VUE_APP_ENV === 'production') ? (`${this.url}`) : (`${process.env.VUE_APP_BASE_API}${this.url}`)
      const format = this.importTypeOption === 'csv' ? '?format=csv&template=update&spm=' : '?format=xlsx&template=update&spm='
      const url = `${baseUrl}${format}` + spm.spm
      return this.downloadCsv(url)
    },
    async handleImportConfirm() {
      this.$refs.upload.submit()
    },
    handleImportCancel() {
      this.showImportDialog = false
    },
    beforeUpload(file) {
      this.isCsv = this.importTypeOption === 'csv' ? _.endsWith(file.name, 'csv') : _.endsWith(file.name, 'xlsx')
      if (!this.isCsv) {
        this.$message.error(
          this.$t('common.NeedSpecifiedFile')
        )
      }
      return this.isCsv
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

</style>
