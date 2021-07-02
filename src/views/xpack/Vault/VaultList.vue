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
  </div>
</template>

<script>
import GenericTreeListPage from '@/layout/components/GenericTreeListPage'
import { AssetUserTable } from '@/components'
import Dialog from '@/components/Dialog'
import { setUrlParam } from '@/utils/common'
import { mapGetters } from 'vuex'

export default {
  name: 'VaultList',
  components: {
    GenericTreeListPage,
    AssetUserTable,
    Dialog
  },
  data() {
    const vm = this
    return {
      errorMsg: '',
      exportOption: '1',
      meta: {},
      MfaExpired: 0,
      showMFADialog: false,
      MFAInput: '',
      selectedRows: '',
      assetUserConfig: {
        hasLeftActions: true,
        hasCreate: true,
        hasClone: false,
        url: '/api/v1/assets/asset-users/'
        // handleImport: function({ selectedRows }) {
        //   this.selectedRows = selectedRows
        //   this.dialogStatus = 'import'
        //   if (!this.needMFAVerify) {
        //     this.showMFADialog = false
        //     this.showImportDialog = true
        //   } else {
        //     this.showMFADialog = true
        //   }
        // }.bind(this),
        // handleExport: function({ selectedRows }) {
        //   this.selectedRows = selectedRows
        //   this.dialogStatus = 'export'
        //   if (!this.needMFAVerify) {
        //     this.showMFADialog = false
        //     this.showExportDialog = true
        //   } else {
        //     this.showMFADialog = true
        //   }
        // }.bind(this)
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
    ...mapGetters([
      'MFA_TTl',
      'MFAVerifyAt',
      'publicSettings'
    ]),
    needMFAVerify() {
      if (!this.publicSettings.SECURITY_VIEW_AUTH_NEED_MFA) {
        return false
      }
      const ttl = this.publicSettings.SECURITY_MFA_VERIFY_TTL
      const now = new Date()
      return !(this.MFAVerifyAt && (now - this.MFAVerifyAt) < ttl * 1000)
    },
    hasSelected() {
      return this.selectedRows.length > 0
    },
    ...mapGetters([
      'MFAVerifyAt',
      'MFA_TTl'
    ])
  },
  methods: {
    performUpdate(item) {
      this.$axios.put(
        `/api/v1/assets/asset-users/`,
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
        `/api/v1/assets/asset-users/`,
        item.file,
        { headers: { 'Content-Type': 'text/csv' }, disableFlashErrorMsg: true }
      ).then((data) => {
        const msg = this.$t('common.imExport.createSuccessMsg', { count: data.length })
        this.onSuccess(msg)
      }).catch(error => {
        this.$message.error(this.$t('common.updateErrorMsg') + ' ' + error)
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
    MFAConfirm() {
      if (this.MFAInput.length !== 6) {
        return this.$message.error(this.$t('common.MFAErrorMsg'))
      }
      this.$axios.post(
        `/api/v1/authentication/otp/verify/`, {
          code: this.MFAInput
        }
      ).then(
        res => {
          this.$store.dispatch('users/setMFAVerify')
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
