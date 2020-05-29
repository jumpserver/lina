<template>
  <div>
    <Dialog width="60%" :visible.sync="showDialog" :title="this.$t('setting.ApiKeyList')" :show-cancel="false" :show-confirm="false">
      <div>
        <el-alert type="success"> {{ helpMessage }} </el-alert>
        <ListTable ref="ListTable" :table-config="tableConfig" :header-actions="headerActions" />
      </div>
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog'
import ListTable from '@/components/ListTable'
import { DateFormatter, ShowKeyFormatter } from '@/components/ListTable/formatters'
export default {
  name: 'ApiKey',
  components: {
    Dialog,
    ListTable
  },
  props: {

  },
  data() {
    return {
      showDialog: false,
      helpMessage: this.$t('setting.helpText.ApiKeyList'),
      tableConfig: {
        hasSelection: true,
        url: `/api/v1/authentication/access-keys/`,
        columns: [
          'id', 'secret', 'is_active', 'date_created', 'actions'
        ],
        columnsMeta: {
          id: {
            label: 'AccessKeyID',
            width: '315px'
          },
          secret: {
            label: 'AccessKeySecret',
            width: '315px',
            formatter: ShowKeyFormatter
          },
          is_active: {
            width: '80px'
          },
          date_created: {
            label: this.$t('setting.DateCreated'),
            formatter: DateFormatter
          },
          actions: {
            prop: '',
            formatterArgs: {
              onDelete: function({ row, col, cellValue, reload }) {
                this.$axios.delete(
                  `/api/v1/authentication/access-keys/${row.id}/`
                ).then(res => {
                  this.$refs.ListTable.reloadTable()
                  this.$message.success(this.$t('common.deleteSuccessMsg'))
                }).catch(error => {
                  this.$message.error(this.$t('common.deleteErrorMsg' + ' ' + error))
                })
              }.bind(this),
              onUpdate: function({ row, col, cellValue, reload }) {
                this.$axios.patch(
                  `/api/v1/authentication/access-keys/${row.id}/`,
                  { is_active: !row.is_active }
                ).then(res => {
                  this.$refs.ListTable.reloadTable()
                  this.$message.success(this.$t('common.updateSuccessMsg'))
                }).catch(error => {
                  this.$message.error(this.$t('common.updateErrorMsg' + ' ' + error))
                })
              }.bind(this)
            }
          }
        }
      },
      headerActions: {
        hasSearch: true,
        hasRightActions: false,
        hasExport: false,
        hasImport: false,
        hasRefresh: true,
        hasBulkDelete: false,
        hasCreate: false,
        extraActions: [
          {
            name: this.$t('setting.Create'),
            title: this.$t('setting.Create'),
            type: 'primary',
            can: true,
            callback: function() {
              this.$axios.post(
                `/api/v1/authentication/access-keys/`
              ).then(res => {
                this.$refs.ListTable.reloadTable()
                this.$message.success(this.$t('common.updateSuccessMsg'))
              }).catch(error => {
                this.$message.error(this.$t('common.updateErrorMsg' + ' ' + error))
              })
            }.bind(this)
          }
        ]
      }
    }
  },
  methods: {
    showApi() {
      this.showDialog = !this.showDialog
    }
  }
}
</script>

<style lang='scss' scoped>
.api-key-dialog >>> .el-dialog__body {
  padding-top: 0;
}
</style>
