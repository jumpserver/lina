<template>
  <div>
    <GenericTreeListPage ref="TreeTablePage" :table-config="tableConfig" :header-actions="headerActions" :tree-setting="treeSetting" />
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
import GenericTreeListPage from '@/layout/components/GenericTreeListPage'
import { ActionsFormatter, DateFormatter } from '@/components/ListTable/formatters'
import Dialog from '@/components/Dialog'

export default {
  name: 'Vault',
  components: {
    GenericTreeListPage,
    Dialog
  },
  data() {
    return {
      showDialog: false,
      dialogInfo: {
        asset: '',
        username: '',
        hostname: '',
        password: '',
        key: ''
      },
      treeSetting: {
        showMenu: false,
        showRefresh: false,
        showAssets: true,
        url: '/api/v1/assets/asset-users/',
        treeUrl: '/api/v1/assets/nodes/children/tree/?assets=1'
      },
      headerActions: {
        hasLeftActions: true,
        hasRightActions: true,
        hasExport: true,
        hasImport: true,
        hasRefresh: true,
        hasSearch: true,
        hasBulkDelete: false,
        hasCreate: true
      },
      tableConfig: {
        url: `/api/v1/assets/asset-users/?latest=1`,
        columns: [
          {
            prop: 'hostname',
            label: this.$t('assets.Hostname')
          },
          {
            prop: 'ip',
            label: this.$t('assets.ip')
          },
          {
            prop: 'username',
            label: this.$t('assets.Username')
          },
          {
            prop: 'version',
            label: this.$t('assets.Version')
          },
          {
            prop: 'date_created',
            label: this.$t('assets.date_joined'),
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
                  name: 'delete',
                  title: this.$t('common.Delete'),
                  type: 'primary',
                  callback: (val) => {
                    this.$axios.delete(`/api/v1/assets/asset-users/${val.cellValue}/`).then(
                      this.$refs.TreeTablePage.$refs.TreeTable.$refs.ListTable.reloadTable()
                    )
                  }
                },
                {
                  name: this.$t('common.Test'),
                  title: this.$t('common.Test'),
                  callback: (val) => {
                    console.log(val.cellValue)
                    this.$axios.post(
                      `api/v1/assets/asset-users/tasks/?id=${val.cellValue}`,
                      { action: 'test' }
                    ).then(res => {
                      window.open(`/core/ops/celery/task/${res.task}/log/`, '', 'width=900,height=600')
                    })
                  }
                },
                {
                  name: this.$t('common.Update'),
                  title: this.$t('common.Update'),
                  callback: function(val) {
                    console.log(val)
                    this.showDialog = true
                    this.dialogInfo.asset = val.row.asset
                    this.dialogInfo.hostname = val.row.hostname
                    this.dialogInfo.username = val.row.username
                  }.bind(this)
                },
                {
                  name: 'Push',
                  title: this.$t('common.Push'),
                  callback: function(val) {
                    console.log('Push')
                  }
                }
              ]
            }
          }
        ]
      }
    }
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
        this.$refs.TreeTablePage.$refs.TreeTable.$refs.ListTable.reloadTable()
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

<style scoped>

</style>
