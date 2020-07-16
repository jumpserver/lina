<template><div>
  <div>
    <ListTable ref="ListTable" :table-config="tableConfig" :header-actions="headerActions" />
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
  </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex'
import ListTable from '@/components/ListTable/index'
import Dialog from '@/components/Dialog'
import { ActionsFormatter, DateFormatter } from '@/components/ListTable/formatters'

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
        key: ''
      },
      tableConfig: {
        url: this.url,
        columns: [
          {
            prop: 'hostname',
            label: this.$t('assets.Hostname'),
            showOverflowTooltip: true
          },
          {
            prop: 'ip',
            label: this.$t('assets.ip'),
            width: 140
          },
          {
            prop: 'username',
            label: this.$t('assets.Username'),
            showOverflowTooltip: true
          },
          {
            prop: 'version',
            label: this.$t('assets.Version'),
            width: '50px'
          },
          {
            prop: 'date_created',
            label: this.$t('assets.date_joined'),
            formatter: DateFormatter
          },
          {
            prop: 'id',
            label: this.$t('common.Action'),
            align: 'center',
            width: 150,
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: false, // can set function(row, value)
              hasDelete: false, // can set function(row, value)
              moreActionsTitle: this.$t('common.More'),
              extraActions: [
                {
                  name: 'View',
                  title: this.$t('common.View'),
                  type: 'primary',
                  callback: function(val) {
                    this.MFAInfo.asset = val.cellValue
                    if (this.MFAVerifyAt + this.MFA_TTl * 1000 > (new Date()).valueOf()) {
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
                    this.$axios.delete(`/api/v1/assets/asset-users/${val.cellValue}/`).then(() => {
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
                      `/api/v1/assets/asset-users/tasks/?id=${val.cellValue}`,
                      { action: 'test' }
                    ).then(res => {
                      window.open(`/#/ops/celery/task/${res.task}/log/`, '', 'width=900,height=600')
                    })
                  }
                },
                {
                  name: 'Update',
                  title: this.$t('common.Update'),
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
        ],
        extraQuery: {
          latest: 1
        }
      },
      headerActions: {
        hasLeftActions: this.hasLeftActions,
        hasBulkDelete: false,
        hasImport: this.hasImport,
        hasExport: this.hasExport,
        hasSearch: true,
        searchConfig: {
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
      'MFAVerifyAt'
    ]),
    needMFAVerify() {
      if (!this.publicSettings.SECURITY_VIEW_AUTH_NEED_MFA) {
        return false
      }
      const ttl = this.publicSettings.SECURITY_MFA_VERIFY_TTL
      const now = new Date()
      return !(this.MFAVerifyAt && (now - this.MFAVerifyAt) < ttl * 1000)
    }
  },
  watch: {
    url(iNew) {
      this.$set(this.tableConfig, 'url', iNew)
    }
  },
  mounted() {
    if (this.otherActions) {
      const actionColumn = this.tableConfig.columns[this.tableConfig.columns.length - 1]
      for (const item of this.otherActions) {
        actionColumn.formatterArgs.extraActions.push(item)
      }
    }
  },
  created() {
    if (this.handleExport) {
      this.headerActions.handleExport = this.handleExport
    }
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
          this.$axios.get(`/api/v1/assets/asset-user-auth-infos/${this.MFAInfo.asset}/`).then(res => {
            this.MFAConfirmed = true
            this.MFAInfo.hostname = res.hostname
            this.MFAInfo.password = res.password
            this.MFAInfo.username = res.username
          })
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
        key: ''
      }
      this.showDialog = false
    },
    Onchange(e) {
      const vm = this
      // TODO 校验文件类型
      const reader = new FileReader()
      reader.onload = function() {
        vm.dialogInfo.key = this.result
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
      if (this.dialogInfo.key !== '') {
        data.key = this.dialogInfo.key
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
        key: ''
      }
      this.showDialog = false
    }
  }
}
</script>

<style lang='less' scoped>

</style>
