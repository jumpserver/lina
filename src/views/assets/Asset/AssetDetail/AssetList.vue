<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="14">
        <ListTable ref="ListTable" :table-config="tableConfig" :header-actions="headerActions" />
      </el-col>
      <el-col :span="10">
        <QuickActions type="primary" :actions="quickActions" />
      </el-col>
    </el-row>
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
import { ActionsFormatter, DateFormatter } from '@/components/ListTable/formatters'
import QuickActions from '@/components/QuickActions/index'

export default {
  name: 'Detail',
  components: {
    QuickActions,
    ListTable
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
                `api/v1/assets/asset-users/tasks/?asset_id=${this.object.id}&latest=1`,
                { action: 'test' }
              ).then(res => {
                console.log(`/ops/celery/task/${res.task}/log/`)
                window.open(`/core/ops/celery/task/${res.task}/log/`, '', 'width=900,height=600')
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
                  name: this.$t('common.Delete'),
                  title: this.$t('common.Delete'),
                  type: 'primary',
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
                }
              ]
            }
          }
        ]
      },
      headerActions: {
        hasRightActions: false,
        hasExport: false,
        hasImport: false,
        hasRefresh: false,
        hasBulkDelete: false,
        hasSearch: true,
        hasCreate: false
      }
    }
  },
  computed: {

  },
  mounted() {
  },
  methods: {
  }
}
</script>

<style lang='less' scoped>

</style>
