<template>
  <div>
    <el-row :gutter="24">
      <el-col :span="18">
        <ListTable ref="ListTable" :table-config="tableConfig" :header-actions="headerActions" />
      </el-col>
      <el-col :span="6">
        <QuickActions type="primary" :actions="quickActions" />
      </el-col>
    </el-row>
    <Dialog width="50" :title="this.$t('common.MFAConfirm')" :visible.sync="showMFADialog" />
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

</template>

<script>
import ListTable from '@/components/ListTable/index'
import QuickActions from '@/components/QuickActions'
import Dialog from '@/components/Dialog'
import { ActionsFormatter, DateFormatter } from '@/components/ListTable/formatters'

export default {
  name: 'Detail',
  components: {
    ListTable,
    QuickActions,
    Dialog
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      quickActions: [
        {
          title: this.$t('assets.TestAssetsConnective'),
          attrs: {
            type: 'primary',
            label: this.$t('assets.Test')
          },
          callbacks: {
            click: function() {
              this.$axios.post(
                `/api/v1/assets/asset-users/tasks/?asset_id=${this.object.id}&latest=1`,
                { action: 'test' }
              ).then(res => {
                console.log(`/ops/celery/task/${res.task}/log/`)
                window.open(`/#/ops/celery/task/${res.task}/log/`, '', 'width=900,height=600')
              }
              )
            }.bind(this)
          }
        }
      ],
      tableConfig: {
        url: `/api/v1/assets/asset-users/?asset_id=${this.object.id}&latest=1`,
        columns: [
          {
            prop: 'hostname',
            label: this.$t('assets.Hostname')
          },
          {
            prop: 'ip',
            label: this.$t('assets.ip'),
            width: '140px'
          },
          {
            prop: 'username',
            label: this.$t('assets.Username')
          },
          {
            prop: 'version',
            label: this.$t('assets.Version'),
            width: '50px'
          },
          {
            prop: 'date_created',
            label: this.$t('assets.DateJoined'),
            formatter: DateFormatter
          },
          {
            prop: 'id',
            align: 'center',
            label: this.$t('assets.Action'),
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: false, // can set function(row, value)
              canUpdate: false, // can set function(row, value)
              hasDelete: false, // can set function(row, value)
              canDelete: false,
              extraActions: [
                {
                  name: this.$t('common.View'),
                  title: this.$t('common.View'),
                  type: 'primary',
                  callback: function(val) {
                    this.showMFADialog = true
                  }.bind(this)
                },
                {
                  name: this.$t('common.Remove'),
                  title: this.$t('common.Remove'),
                  callback: (val) => {
                    this.$axios.delete(`/api/v1/assets/asset-users/${val.cellValue}/`).then(res => {
                      this.$refs.ListTable.reloadTable()
                      this.$message.success(this.$t('common.deleteSuccessMsg'))
                    }).catch(error => {
                      this.$message.error(this.$t('common.deleteErrorMsg' + ' ' + error))
                    })
                  }
                },
                {
                  name: this.$t('common.Test'),
                  title: this.$t('common.Test'),
                  callback: (val) => {
                    console.log(val.cellValue)
                    this.$axios.post(
                      `/api/v1/assets/asset-users/tasks/?id=${val.cellValue}`,
                      { action: 'test' }
                    ).then(res => {
                      window.open(`/#/ops/celery/task/${res.task}/log/`, '', 'width=900,height=600')
                    })
                  }
                },
                {
                  name: this.$t('common.Update'),
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
        ]
      },
      headerActions: {
        hasRightActions: false,
        hasLeftActions: false,
        hasRefresh: false
      },
      showDialog: false,
      showMFADialog: false,
      dialogInfo: {
        asset: '',
        username: '',
        hostname: '',
        password: '',
        key: ''
      }
    }
  },
  computed: {

  },
  mounted() {
  },
  methods: {
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
