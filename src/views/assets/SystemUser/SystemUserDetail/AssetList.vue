<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="14">
        <ListTable ref="ListTable" :table-config="tableConfig" :header-actions="headerActions" />
      </el-col>
      <el-col :span="10">
        <QuickActions type="primary" :actions="quickActions" />
        <RelationCard type="info" style="margin-top: 15px" v-bind="nodeRelationConfig" />
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
import { CustomActionsFormatter, DateFormatter } from '@/components/ListTable/formatters'
import QuickActions from '@/components/QuickActions/index'
import RelationCard from '@/components/RelationCard'
import Dialog from '@/components/Dialog'

export default {
  name: 'Detail',
  components: {
    QuickActions,
    ListTable,
    RelationCard,
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
      showDialog: false,
      dialogInfo: {
        asset: '',
        username: '',
        hostname: '',
        password: '',
        key: ''
      },
      AutoPushConfig: {
        icon: 'fa-info',
        title: this.$t('assets.QuickUpdate'),
        url: `/api/v1/assets/system-users/${this.object.id}/`,
        content: [
          {
            name: this.$t('assets.AutoPush'),
            auto_push: this.object.auto_push
          }
        ]
      },
      systemUserRelationConfig: {
        icon: 'fa-info',
        title: this.$t('assets.command_filter_list'),
        objectsAjax: {
          url: '/api/v1/assets/system-users/'
        },
        hasObjectsId: this.object.system_users,
        performAdd: (items) => {
          // TODO: Orange API 待修复
          const relationUrl = `/api/v1/assets/cmd-filters/`
          const objectId = this.object.id
          const data = items.map(v => {
            return {
              cmd_filter: objectId,
              systemuser: v.value
            }
          })
          return this.$axios.post(relationUrl, data)
        },
        performDelete: (item) => {
          const itemId = item.value
          const objectId = this.object.id
          // TODO: Orange API 待修复
          const relationUrl = `/api/v1/assets/cmd-filters/?cmd-filters=${objectId}&systemuser=${itemId}`
          return this.$axios.delete(relationUrl)
        }
      },
      quickActions: [
        {
          title: this.$t('assets.TestAssetsConnective'),
          attrs: {
            type: 'primary',
            label: this.$t('common.Test')
          },
          callbacks: {
            click: function() {
              this.$axios.post(
                `api/v1/assets/system-users/${this.object.id}/tasks/`,
                { action: 'test' }
              ).then(res => {
                window.open(`/core/ops/celery/task/${res.task}/log/`, '', 'width=900,height=600')
              }
              )
            }.bind(this)
          }
        }
      ],
      tableConfig: {
        url: `/api/v1/assets/asset-users/?prefer_id=${this.object.id}&prefer=system_user&latest=1`,
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
            formatter: CustomActionsFormatter,
            formatterArgs: {
              extraActions: [
                {
                  name: 'delete',
                  title: this.$t('common.Delete'),
                  callback: (val) => {
                    this.$axios.delete(`/api/v1/assets/asset-users/${val.cellValue}/`).then(
                      this.$refs.ListTable.reloadTable()
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
      },
      headerActions: {
        hasRightActions: false,
        hasExport: false,
        hasImport: false,
        hasRefresh: false,
        hasLeftActions: false,
        hasBulkDelete: false,
        hasSearch: true,
        hasCreate: false
      },
      nodeRelationConfig: {
        icon: 'fa-info',
        title: this.$t('perms.addNodeToThisPermission'),
        objectsAjax: {
          url: '/api/v1/assets/nodes/',
          transformOption: (item) => {
            return { label: item.full_value, value: item.id }
          }
        },
        hasObjectsId: [],
        hasObjects: [],
        performAdd: (items) => {
          const relationUrl = `/api/v1/assets/system-users-nodes-relations/`
          const objectId = this.object.id
          const data = items.map(v => {
            return {
              systemuser: objectId,
              node: v.value
            }
          })
          return this.$axios.post(relationUrl, data).then(res => {
            this.$message.success(this.$t('common.updateSuccessMsg'))
          }).catch(err => {
            this.$message.error(this.$t('common.updateErrorMsg' + ' ' + err))
          })
        },
        performDelete: (item) => {
          const itemId = item.value
          const objectId = this.object.id
          const relationUrl = `/api/v1/assets/system-users-nodes-relations/?systemuser=${objectId}&node=${itemId}`
          return this.$axios.delete(relationUrl).then(res => {
            this.$message.success(this.$t('common.updateSuccessMsg'))
          }).catch(err => {
            this.$message.error(this.$t('common.updateErrorMsg' + ' ' + err))
          })
        }
      }
    }
  },
  computed: {

  },
  mounted() {
    this.getNodeList()
  },
  methods: {
    getNodeList() {
      this.$axios.get(
        `/api/v1/assets/system-users-nodes-relations/?systemuser=${this.object.id}&draw=1&limit=15&offset=0`
      ).then(data => {
        for (const x in data.results) {
          this.nodeRelationConfig.hasObjectsId.push(data.results[x].node)
          this.nodeRelationConfig.hasObjects.push({
            value: data.results[x].node,
            label: data.results[x].node_display
          })
        }
      }
      )
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
