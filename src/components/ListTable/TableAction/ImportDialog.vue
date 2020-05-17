<template>
  <Dialog :title="$t('common.Import')" :visible.sync="showImportDialog" center @confirm="handleDialogConfirm('import')" @cancel="handleDialogCancel('import')">
    <el-form label-position="left" style="padding-left: 50px">
      <el-form-item :label="$t('common.Import' )" :label-width="'100px'">
        <el-radio v-model="importOption" class="export-item" label="1">{{ this.$t('common.Create') }}</el-radio>
        <br>
        <el-radio v-model="importOption" class="export-item" label="2">{{ this.$t('common.Update') }}</el-radio>
        <div>
          <span v-if="importOption==='1'">{{ this.$t('common.imExport.downloadImportTemplateMsg') }}<a style="color: #428bca;" :href="downloadImportTempUrl">{{ this.$t('common.Download') }}</a></span>
          <span v-else>{{ this.$t('common.imExport.downloadUpdateTemplateMsg') }} <a style="color: #428bca;" @click="downloadUpdateTempUrl">{{ this.$t('common.Download') }}</a></span>
        </div>
      </el-form-item>
      <el-form-item :label="$t('common.Upload' )" :label-width="'100px'">
        <el-upload
          class="upload-card"
          action="string"
          :http-request="upload"
          list-type="text/csv"
          :limit="1"
        >
          <el-button size="mini" type="primary">{{ this.$t('common.Upload') }}</el-button>
          <div slot="tip" class="el-upload__tip">{{ this.$t('common.imExport.onlyCSVFilesTips') }}</div>
        </el-upload>
      </el-form-item>
    </el-form>
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
      exportOption: '1',
      meta: {}
    }
  },
  computed: {
    hasSelected() {
      return this.selectedRows.length > 0
    },
    importTitle() {
      if (this.importOption === '1') {
        return this.$t('common.Import')
      } else {
        return this.$t('common.Update')
      }
    },
    upLoadUrl() {
      return this.url
    },
    downloadImportTempUrl() {
      return process.env.VUE_APP_BASE_API + this.url + '?format=csv&template=import&limit=1'
    }
  },
  mounted() {
    this.$eventBus.$on('showExportDialog', (row) => {
      this.showExportDialog = true
    })
    this.$eventBus.$on('showImportDialog', (row) => {
      this.showImportDialog = true
    })
  },
  methods: {
    upload(item) {
      this.$axios.put(
        this.upLoadUrl,
        item.file
      ).then((res) => {
        console.log('')
      })
    },
    downloadCsv(url) {
      const a = document.createElement('a')
      a.href = url
      a.click()
      window.URL.revokeObjectURL(url)
    },
    async handleExport() {
      let data
      var resources = []
      if (this.exportOption === '1') {
        data = this.$parent.$parent.$refs.dataTable.$refs.dataTable.getData()
      } else if (this.exportOption === '2') {
        data = this.selectedRows
      } else {
        data = []
      }
      for (let index = 0; index < data.length; index++) {
        resources.push(data[index].id)
      }
      const spm = await createSourceIdCache(resources)
      const url = process.env.VUE_APP_BASE_API + `${this.url}?format=csv&?spm=` + spm.spm
      return this.downloadCsv(url)
    },
    handleImport() {
    },
    async downloadUpdateTempUrl() {
      var resources = []
      const data = this.$parent.$parent.$refs.dataTable.$refs.dataTable.getData()
      for (let index = 0; index < data.length; index++) {
        resources.push(data[index].id)
      }
      const spm = await createSourceIdCache(resources)
      const url = process.env.VUE_APP_BASE_API + `${this.url}?format=csv&template=update&spm=` + spm.spm
      return this.downloadCsv(url)
    },
    async handleDialogConfirm(val) {
      switch (val) {
        case 'export':
          await this.handleExport()
          this.showExportDialog = false
          break
        case 'import':
          await this.handleImport()
          this.showImportDialog = false
          break
        default:
          break
      }
    },
    handleDialogCancel(val) {
      switch (val) {
        case 'export':
          this.showExportDialog = false
          break
        case 'import':
          this.showImportDialog = false
          break
        default:
          break
      }
    }
  }
}
</script>

<style lang='less' scoped>

</style>
