<template>
  <div>
    <GenericTreeListPage ref="TreeTablePage" :tree-setting="treeSetting">
      <template #table>
        <AssetUserTable ref="table" v-bind="assetUserConfig" />
      </template>
    </GenericTreeListPage>
    <Dialog width="50" :title="this.$t('common.MFAConfirm')" :visible.sync="showMFADialog" :show-confirm="false" :show-cancel="false" :destroy-on-close="true">
      <el-row :gutter="20">
        <el-col :span="4">
          <div style="line-height: 34px;text-align: center">MFA</div>
        </el-col>
        <el-col :span="14">
          <el-input v-model="MFAInput" />
          <span class="help-tips help-block">{{ $t('common.MFARequireForSecurity') }}</span>
        </el-col>
        <el-col :span="4">
          <el-button size="mini" type="primary" style="line-height:20px " @click="MFAConfirm">{{ this.$t('common.Confirm') }}</el-button>
        </el-col>
      </el-row>
    </Dialog>
    <Dialog :title="$t('common.Export')" :visible.sync="showExportDialog" @confirm="handleExportConfirm()" @cancel="handleExportCancel()">
      <el-form label-position="left" style="padding-left: 50px">
        <el-form-item :label="this.$t('common.imExport.ExportRange')" :label-width="'100px'">
          <el-radio v-model="exportOption" class="export-item" label="1">{{ this.$t('common.imExport.ExportAll') }}</el-radio>
          <br>
          <el-radio v-model="exportOption" class="export-item" label="2">{{ this.$t('common.imExport.ExportOnlySelectedItems') }}</el-radio>
          <br>
          <el-radio v-model="exportOption" class="export-item" label="3">{{ this.$t('common.imExport.ExportOnlyFiltered') }}</el-radio>
        </el-form-item>
      </el-form>
    </Dialog>
    <Dialog :title="$t('common.Import')" :visible.sync="showImportDialog" @confirm="handleImportConfirm" @cancel="handleImportCancel()">
      <el-form label-position="left" style="padding-left: 50px">
        <el-form-item :label="$t('common.Import' )" :label-width="'100px'">
          <el-radio v-model="importOption" class="export-item" disabled label="1">{{ this.$t('common.Create') }}</el-radio>
          <el-radio v-model="importOption" class="export-item" disabled label="2">{{ this.$t('common.Update') }}</el-radio>
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
            :http-request="handleImport"
            list-type="text/csv"
            :limit="1"
            :auto-upload="false"
            :before-upload="beforeUpload"
          >
            <el-button size="mini" type="default">{{ this.$t('common.SelectFile') }}</el-button>
            <div slot="tip" :class="uploadHelpTextClass" style="line-height: 1.5">{{ this.$t('common.imExport.onlyCSVFilesTips') }}</div>
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
  </div>
</template>

<script>
import GenericTreeListPage from '@/layout/components/GenericTreeListPage'
import { AssetUserTable } from '@/components'
import Dialog from '@/components/Dialog'
import { setUrlParam } from '@/utils/common'
import { createSourceIdCache } from '@/api/common'
import * as queryUtil from '@/components/DataTable/compenents/el-data-table/utils/query'

export default {
  name: 'Vault',
  components: {
    GenericTreeListPage,
    AssetUserTable,
    Dialog
  },
  data() {
    const vm = this
    return {
      showImportDialog: false,
      importOption: '1',
      isCsv: true,
      errorMsg: '',
      showExportDialog: false,
      exportOption: '1',
      meta: {},
      showMFADialog: false,
      MFAInput: '',
      selectedRows: '',
      assetUserConfig: {
        hasLeftActions: true,
        hasCreate: true,
        url: '/api/v1/assets/asset-users/',
        handleImport: function({ selectedRows }) {
          this.selectedRows = selectedRows
          this.showMFADialog = true
          this.dialogStatus = 'import'
          console.log(this.selectedRows)
        }.bind(this),
        handleExport: function({ selectedRows }) {
          this.selectedRows = selectedRows
          this.showMFADialog = true
          this.dialogStatus = 'export'
          console.log(this.selectedRows)
        }.bind(this)
      },
      treeSetting: {
        showMenu: false,
        showRefresh: false,
        showAssets: true,
        url: '/api/v1/assets/asset-users/',
        treeUrl: '/api/v1/assets/nodes/children/tree/?assets=1',
        callback: {
          onSelected: function(event, treeNode) {
            let url = vm.assetUserConfig.url
            if (treeNode.meta.type === 'node') {
              const nodeId = treeNode.meta.node.id
              url = setUrlParam(url, 'asset_id', '')
              url = setUrlParam(url, 'node_id', nodeId)
            } else if (treeNode.meta.type === 'asset') {
              const assetId = treeNode.meta.asset.id
              console.log('Asset id: ', assetId)
              url = setUrlParam(url, 'node_id', '')
              url = setUrlParam(url, 'asset_id', assetId)
            }
            setTimeout(() => {
              vm.assetUserConfig.url = url
            }, 100)
          }
        }
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
    downloadImportTempUrl() {
      const baseUrl = `/api/v1/assets/asset-user-auth-infos/`
      return baseUrl + '?format=csv&template=import&limit=1'
    },
    uploadHelpTextClass() {
      const cls = ['el-upload__tip']
      if (!this.isCsv) {
        cls.push('error-msg')
      }
      return cls
    }
  },
  methods: {
    performUpdate(item) {
      this.$axios.put(
        this.upLoadUrl,
        item.file,
        { headers: { 'Content-Type': 'text/csv' }, disableFlashErrorMsg: true }
      ).then((data) => {
        const msg = this.$t('common.imExport.updateSuccessMsg', { count: data.length })
        this.onSuccess(msg)
      }).catch(error => {
        this.catchError(error)
      })
    },
    performCreate(item) {
      this.$axios.post(
        this.upLoadUrl,
        item.file,
        { headers: { 'Content-Type': 'text/csv' }, disableFlashErrorMsg: true }
      ).then((data) => {
        const msg = this.$t('common.imExport.createSuccessMsg', { count: data.length })
        this.onSuccess(msg)
      }).catch(error => {
        this.catchError(error)
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
      const baseUrl = (process.env.VUE_APP_ENV === 'production') ? (`${this.url}`) : (`${process.env.VUE_APP_BASE_API}${this.url}`)
      const url = `${baseUrl}?format=csv&template=update&spm=` + spm.spm
      return this.downloadCsv(url)
    },
    async handleImportConfirm() {
      this.$refs.upload.submit()
    },
    handleImportCancel() {
      this.showImportDialog = false
    },
    beforeUpload(file) {
      this.isCsv = _.endsWith(file.name, 'csv')
      return this.isCsv
    },
    downloadCsv(url) {
      const a = document.createElement('a')
      a.href = url
      a.click()
      window.URL.revokeObjectURL(url)
    },
    async handleExport() {
      const url = `/api/v1/assets/asset-user-auth-infos/`
      let query = {}
      if (this.exportOption === '2') {
        const resources = []
        const data = this.selectedRows
        for (let index = 0; index < data.length; index++) {
          resources.push(data[index].id)
        }
        const spm = await createSourceIdCache(resources)
        query['spm'] = spm.spm
      } else if (this.exportOption === '3') {
        const listTableRef = this.$parent.$parent.$parent.$parent
        // console.log(listTableRef)
        // console.log(listTableRef.dataTable)
        query = listTableRef.dataTable.getQuery()
        delete query['limit']
        delete query['offset']
      }
      query['format'] = 'csv'
      const queryStr =
        (url.indexOf('?') > -1 ? '&' : '?') +
        queryUtil.stringify(query, '=', '&')
      return this.downloadCsv(url + queryStr)
    },
    async handleExportConfirm() {
      await this.handleExport()
      this.showExportDialog = false
    },
    handleExportCancel() {
      this.showExportDialog = false
    },
    MFAConfirm() {
      if (this.MFAInput.length !== 6) {
        return this.$message.error(this.$t('common.updateErrorMsg'))
      }
      this.$axios.post(
        `/api/v1/authentication/otp/verify/`, {
          code: this.MFAInput
        }
      ).then(
        res => {
          if (this.dialogStatus === 'import') {
            this.showMFADialog = false
            this.showImportDialog = true
          } else {
            this.showMFADialog = false
            this.showExportDialog = true
          }
        }
      )
    }
  }
}
</script>

<style scoped>

</style>
