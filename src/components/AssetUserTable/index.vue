<template>
  <div>
    <div>
      <ListTable ref="ListTable" :table-config="iTableConfig" :header-actions="headerActions" />
      <Dialog v-if="showMFADialog" width="50" :title="this.$t('common.MFAConfirm')" :visible.sync="showMFADialog" :show-confirm="false" :show-cancel="false" :destroy-on-close="true">
        <div v-if="MFAConfirmed">
          <el-form label-position="right" label-width="80px" :model="MFAInfo">
            <el-form-item :label="this.$t('assets.Hostname')">
              <el-input v-model="MFAInfo.hostname" disabled />
            </el-form-item>
            <el-form-item :label="this.$t('assets.Username')">
              <el-input v-model="MFAInfo.username" disabled />
            </el-form-item>
            <el-form-item :label="this.$t('assets.Password')">
              <el-input v-model="MFAInfo.password" type="password" show-password />
            </el-form-item>
          </el-form>
        </div>
        <el-row v-else :gutter="20">
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
      <Dialog width="50" :title="this.$t('assets.UpdateAssetUserToken')" :visible.sync="showDialog" @confirm="handleConfirm()" @cancel="handleCancel()">
        <el-form label-position="right" label-width="80px" :model="dialogInfo">
          <el-form-item :label="this.$t('assets.Hostname')">
            <el-input v-model="dialogInfo.hostname" disabled />
          </el-form-item>
          <el-form-item :label="this.$t('assets.Username')">
            <el-input v-model="dialogInfo.username" disabled />
          </el-form-item>
          <el-form-item :label="this.$t('assets.Password')">
            <el-input v-model="dialogInfo.password" type="password" />
          </el-form-item>
          <el-form-item :label="this.$t('assets.sshkey')">
            <input type="file" @change="Onchange">
          </el-form-item>
        </el-form>
      </Dialog>
      <Dialog :title="$t('common.Export')" :visible.sync="showExportDialog" :destroy-on-close="true" @confirm="handleExportConfirm()" @cancel="handleExportCancel()">
        <el-form label-position="left" style="padding-left: 50px">
          <el-form-item :label="$t('common.fileType' )" :label-width="'100px'">
            <el-radio-group v-model="exportTypeOption">
              <el-radio v-for="option of exportTypeOptions" :key="option.value" style="padding: 10px 20px;" :label="option.value" :disabled="!option.can">{{ option.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="this.$t('common.imExport.ExportRange')" :label-width="'100px'">
            <el-radio-group v-model="exportOption">
              <el-radio v-for="option of exportOptions" :key="option.value" class="export-item" :label="option.value" :disabled="!option.can">{{ option.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </Dialog>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ListTable from '@/components/ListTable/index'
import Dialog from '@/components/Dialog'
import { createSourceIdCache } from '@/api/common'
import * as queryUtil from '@/components/DataTable/compenents/el-data-table/utils/query'
import { ActionsFormatter, DateFormatter } from '@/components/TableFormatters'

export default {
  name: 'Detail',
  components: {
    ListTable,
    Dialog
  },
  props: {
    url: {
      type: String,
      required: true
    },
    searchExclude: {
      type: Array,
      default: () => []
    },
    extraQuery: {
      type: Object,
      default: () => ({})
    },
    canExportAll: {
      type: Boolean,
      default: true
    },
    canExportSelected: {
      type: Boolean,
      default: true
    },
    canExportFiltered: {
      type: Boolean,
      default: true
    },
    hasLeftActions: {
      type: Boolean,
      default: false
    },
    otherActions: {
      type: Array,
      default: null
    },
    handleExport: {
      type: Function,
      default: null
    },
    handleImport: {
      type: Function,
      default: null
    },
    hasImport: {
      type: Boolean,
      default: true
    },
    hasExport: {
      type: Boolean,
      default: true
    },
    hasClone: {
      type: Boolean,
      default: true
    },
    tableConfig: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      MFAConfirmed: false,
      MFAInput: '',
      MFAInfo: {
        asset: '',
        username: '',
        hostname: '',
        password: ''
      },
      showDialog: false,
      showMFADialog: false,
      dialogInfo: {
        asset: '',
        username: '',
        hostname: '',
        password: '',
        private_key: ''
      },
      selectedRows: '',
      dialogStatus: '',
      showExportDialog: false,
      exportOption: 'all',
      exportTypeOption: 'csv',
      defaultTableConfig: {
        url: this.url,
        columns: ['hostname', 'ip', 'username', 'version', 'date_created', 'actions'],
        columnsMeta: {
          'hostname': {
            label: this.$t('assets.Hostname'),
            showOverflowTooltip: true
          },
          'ip': {
            label: this.$t('assets.ip'),
            width: '120px'
          },
          'username': {
            label: this.$t('assets.Username'),
            showOverflowTooltip: true
          },
          'version': {
            label: this.$t('assets.Version'),
            width: '70px'
          },
          'date_created': {
            label: this.$t('assets.date_joined'),
            formatter: DateFormatter
          },
          'actions': {
            label: this.$t('common.Action'),
            align: 'center',
            width: 150,
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: false, // can set function(row, value)
              hasDelete: false, // can set function(row, value)
              hasClone: this.hasClone,
              moreActionsTitle: this.$t('common.More'),
              extraActions: [
                {
                  name: 'View',
                  title: this.$t('common.View'),
                  type: 'primary',
                  callback: function(val) {
                    this.dialogStatus = 'viewAutoInfo'
                    this.MFAInfo.asset = val.row.id
                    if (!this.needMFAVerify) {
                      this.showMFADialog = true
                      this.MFAConfirmed = true
                      this.$axios.get(`/api/v1/assets/asset-user-auth-infos/${this.MFAInfo.asset}/`).then(res => {
                        this.MFAConfirmed = true
                        this.MFAInfo.hostname = res.hostname
                        this.MFAInfo.password = res.password
                        this.MFAInfo.username = res.username
                      })
                    } else {
                      this.showMFADialog = true
                    }
                  }.bind(this)
                },
                {
                  name: 'Delete',
                  title: this.$t('common.Delete'),
                  type: 'primary',
                  callback: (val) => {
                    this.$axios.delete(`/api/v1/assets/asset-users/${val.row.id}/`).then(() => {
                      this.$message.success(this.$t('common.deleteSuccessMsg'))
                      this.$refs.ListTable.reloadTable()
                    })
                  }
                },
                {
                  name: 'Test',
                  title: this.$t('common.Test'),
                  callback: (val) => {
                    this.$axios.post(
                      `/api/v1/assets/asset-users/tasks/?id=${val.row.id}`,
                      { action: 'test' }
                    ).then(res => {
                      window.open(`/#/ops/celery/task/${res.task}/log/`, '', 'width=900,height=600')
                    })
                  }
                },
                {
                  name: 'Update',
                  title: this.$t('common.Update'),
                  can: !this.$store.getters.currentOrgIsRoot,
                  callback: function(val) {
                    this.showDialog = true
                    this.dialogInfo.asset = val.row.asset
                    this.dialogInfo.hostname = val.row.hostname
                    this.dialogInfo.username = val.row.username
                  }.bind(this)
                }
              ]
            }
          }
        },
        extraQuery: this.extraQuery || { latest: 1 }
      },
      headerActions: {
        hasLeftActions: this.hasLeftActions,
        hasMoreActions: false,
        hasImport: this.hasImport,
        hasExport: this.hasExport,
        hasSearch: true,
        searchConfig: {
          exclude: this.searchExclude,
          options: [
            {
              label: this.$t('assets.OnlyLatestVersion'),
              value: 'latest',
              children: [
                {
                  label: this.$t('common.Yes'),
                  value: 1
                },
                {
                  label: this.$t('common.No'),
                  value: 0
                }
              ]
            }
          ]
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
    iTableConfig() {
      const columnsMeta = Object.assign({}, this.defaultTableConfig.columnsMeta, this.tableConfig.columnsMeta || {})
      const config = Object.assign(this.defaultTableConfig, this.tableConfig)
      config.columnsMeta = columnsMeta
      return config
    },
    exportOptions() {
      return [
        {
          label: this.$t('common.imExport.ExportAll'),
          value: 'all',
          can: this.canExportAll
        },
        {
          label: this.$t('common.imExport.ExportOnlySelectedItems'),
          value: 'selected',
          can: this.selectedRows.length > 0 && this.canExportSelected
        },
        {
          label: this.$t('common.imExport.ExportOnlyFiltered'),
          value: 'filtered',
          can: this.tableHasQuery() && this.canExportFiltered
        }
      ]
    },
    exportTypeOptions() {
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
    }
  },
  watch: {
    url(iNew) {
      this.$set(this.iTableConfig, 'url', iNew)
    }
  },
  mounted() {
    if (this.otherActions) {
      const actionColumn = this.iTableConfig.columns[this.iTableConfig.columns.length - 1]
      for (const item of this.otherActions) {
        actionColumn.formatterArgs.extraActions.push(item)
      }
    }
  },
  created() {
    this.headerActions.handleExport = this.handleExport || this.defaultHandleExport
    if (this.handleImport) {
      this.headerActions.handleImport = this.handleImport
    }
  },
  methods: {
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
          if (this.dialogStatus === 'export') {
            this.showMFADialog = false
            this.showExportDialog = true
          } else {
            this.$axios.get(`/api/v1/assets/asset-user-auth-infos/${this.MFAInfo.asset}/`).then(res => {
              this.MFAConfirmed = true
              this.MFAInfo.hostname = res.hostname
              this.MFAInfo.password = res.password
              this.MFAInfo.username = res.username
            })
          }
        }
      )
    },
    handleMFAConfirm() {
      this.MFAInfo = {
        asset: '',
        username: '',
        hostname: '',
        password: ''
      }
      this.MFAInput = ''
      this.showMFADialog = false
      this.MFAConfirmed = false
    },
    handleCancel() {
      this.dialogInfo = {
        asset: '',
        username: '',
        hostname: '',
        password: '',
        private_key: ''
      }
      this.showDialog = false
      this.$refs.ListTable.reloadTable()
    },
    Onchange(e) {
      const vm = this
      // TODO 校验文件类型
      const reader = new FileReader()
      reader.onload = function() {
        vm.dialogInfo.private_key = this.result
      }
      reader.readAsText(
        e.target.files[0]
      )
    },
    handleConfirm() {
      const data = {
        asset: this.dialogInfo.asset,
        username: this.dialogInfo.username
      }
      if (this.dialogInfo.password !== '') {
        data.password = this.dialogInfo.password
      }
      if (this.dialogInfo.private_key !== '') {
        data.private_key = this.dialogInfo.private_key
      }
      this.$axios.post(
        `/api/v1/assets/asset-users/`,
        data
      ).then(res => {
        this.$message.success(this.$t('common.updateSuccessMsg'))
      }).catch(err => {
        this.$message.error(this.$t('common.updateErrorMsg' + ' ' + err))
      })
      this.dialogInfo = {
        asset: '',
        username: '',
        hostname: '',
        password: '',
        private_key: ''
      }
      this.showDialog = false
      this.$refs.ListTable.reloadTable()
    },
    tableQuery() {
      const listTableRef = this.$refs.ListTable
      if (!listTableRef) {
        return {}
      }
      const query = listTableRef.dataTable.getQuery()
      delete query['limit']
      delete query['offset']
      delete query['date_from']
      delete query['date_to']
      return query
    },
    tableHasQuery() {
      return Object.keys(this.tableQuery()).length > 0
    },
    defaultHandleExport({ selectedRows }) {
      this.selectedRows = selectedRows
      this.dialogStatus = 'export'
      if (!this.needMFAVerify) {
        this.showMFADialog = false
        this.showExportDialog = true
      } else {
        this.showMFADialog = true
      }
    },
    downloadCsv(url) {
      const a = document.createElement('a')
      a.href = url
      a.click()
      window.URL.revokeObjectURL(url)
    },
    async performExport(selectRows, exportOption, q) {
      const url = `/api/v1/assets/asset-user-auth-infos/`
      const query = Object.assign({}, q)
      if (exportOption === 'selected') {
        const resources = []
        const data = selectRows
        for (let index = 0; index < data.length; index++) {
          resources.push(data[index].id)
        }
        const spm = await createSourceIdCache(resources)
        query['spm'] = spm.spm
      } else if (exportOption === 'filtered') {
        // console.log(listTableRef)
        // console.log(listTableRef.dataTable)
        // delete query['limit']
        // delete query['offset']
      }
      query['format'] = this.exportTypeOption
      const queryStr =
        (url.indexOf('?') > -1 ? '&' : '?') +
        queryUtil.stringify(query, '=', '&')
      return this.downloadCsv(url + queryStr)
    },
    async performExportConfirm() {
      const listTableRef = this.$refs.ListTable
      const query = listTableRef.dataTable.getQuery()
      delete query['limit']
      delete query['offset']
      return this.performExport(this.selectedRows, this.exportOption, query)
    },
    async handleExportConfirm() {
      await this.performExportConfirm()
      this.showExportDialog = false
    },
    handleExportCancel() {
      this.showExportDialog = false
    }
  }
}
</script>

<style lang='scss' scoped>
  .export-item {
    width: 100%;
    display: block;
    padding: 10px 20px;
  }

  .export-form >>> .el-form-item__label {
    line-height: 2
  }
</style>
