<template>
  <Dialog :title="$t('common.Import')" :visible.sync="showImportDialog" center @confirm="handleImportConfirm()" @cancel="handleImportCancel('import')">
    <el-form label-position="left" style="padding-left: 50px">
      <el-form-item :label="$t('common.Import' )" :label-width="'100px'">
        <el-radio v-model="importOption" class="export-item" label="1">{{ this.$t('common.Create') }}</el-radio>
        <el-radio v-model="importOption" class="export-item" label="2">{{ this.$t('common.Update') }}</el-radio>
        <div>
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
          :http-request="handleImport"
          list-type="text/csv"
          :limit="1"
        >
          <el-button size="mini" type="default">{{ this.$t('common.SelectFile') }}</el-button>
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
      importOption: '1'
    }
  },
  computed: {
    hasSelected() {
      return this.selectedRows.length > 0
    },
    upLoadUrl() {
      return this.url
    },
    downloadImportTempUrl() {
      return process.env.VUE_APP_BASE_API + this.url + '?format=csv&template=import&limit=1'
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
        { headers: { 'Content-Type': 'text/csv' }}
      ).then((data) => {
        const msg = this.$t('common.imExport.updateSuccessMsg', { count: data.length })
        this.$message.success(msg)
      })
    },
    performCreate(item) {
      this.$axios.post(
        this.upLoadUrl,
        item.file,
        { headers: { 'Content-Type': 'text/csv' }}
      ).then((data) => {
        const msg = this.$t('common.imExport.createSuccessMsg', { count: data.length })
        this.$message.success(msg)
      })
    },
    downloadCsv(url) {
      const a = document.createElement('a')
      a.href = url
      a.click()
      window.URL.revokeObjectURL(url)
    },
    handleImport(item) {
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
      const url = process.env.VUE_APP_BASE_API + `${this.url}?format=csv&template=update&spm=` + spm.spm
      return this.downloadCsv(url)
    },
    async handleImportConfirm() {
      this.$refs.upload.submit()
    },
    handleImportCancel() {
      this.showImportDialog = false
    }
  }
}
</script>

<style lang='less' scoped>

</style>
