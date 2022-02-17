<template>
  <div>
    <Dialog :destroy-on-close="true" width="60%" :visible.sync="showDialog" :title="this.$t('common.nav.TempPassword')" :show-cancel="false" :show-confirm="false">
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
export default {
  name: 'TempPassword',
  components: {
    Dialog,
    ListTable
  },
  props: {

  },
  data() {
    return {
      showDialog: false,
      helpMessage: this.$t('setting.helpText.TempPassword'),
      tableConfig: {
        hasSelection: false,
        hasPagination: false,
        url: `/api/v1/authentication/temp-password/`,
        columns: [
          'temp_password', 'expire', 'actions'
        ],
        columnsMeta: {
          temp_password: {
            label: this.$t('common.nav.TempPassword')
          },
          expire: {
            label: this.$t('setting.Expired'),
            width: '100px'
          },
          actions: {
            prop: '',
            formatterArgs: {
              hasUpdate: false,
              hasClone: false,
              onDelete: function({ row, col, cellValue, reload }) {
                this.$axios.delete(
                  `/api/v1/authentication/temp-password/`
                ).then(res => {
                  this.$refs.ListTable.reloadTable()
                  this.$message.success(this.$t('common.deleteSuccessMsg'))
                }).catch(error => {
                  this.$message.error(this.$t('common.deleteErrorMsg') + ' ' + error)
                })
              }.bind(this)
            }
          }
        }
      },
      headerActions: {
        hasSearch: false,
        hasRightActions: true,
        hasRefresh: true,
        hasExport: false,
        hasImport: false,
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
                `/api/v1/authentication/temp-password/`
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
    show() {
      this.showDialog = !this.showDialog
    }
  }
}
</script>

<style lang='scss' scoped>
</style>
