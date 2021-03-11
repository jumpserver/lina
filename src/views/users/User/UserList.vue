<template>
  <div>
    <GenericListPage
      ref="GenericListPage"
      :table-config="tableConfig"
      :header-actions="headerActions"
    />
    <GenericUpdateFormDialog
      :selected-rows="updateSelectedDialogSetting.selectedRows"
      :form-setting="updateSelectedDialogSetting.formSetting"
      :dialog-setting="updateSelectedDialogSetting.dialogSetting"
      @update="handleDialogUpdate"
    />
    <InviteUsersDialog :setting="InviteDialogSetting" @close="handleInviteDialogClose" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { GenericListPage } from '@/layout/components'
import { GenericUpdateFormDialog } from '@/layout/components'
import { createSourceIdCache } from '@/api/common'
import { getDayFuture } from '@/utils/common'
import InviteUsersDialog from '@/views/users/User/components/InviteUsersDialog'

export default {
  components: {
    InviteUsersDialog,
    GenericListPage,
    GenericUpdateFormDialog
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/users/users/',
        columns: [
          'name', 'username', 'email', 'phone', 'wechat',
          'groups_display', 'total_role_display', 'source',
          'is_valid', 'login_blocked', 'mfa_enabled', 'is_expired',
          'mfa_force_enabled',
          'last_login', 'date_joined', 'date_password_last_updated',
          'comment', 'created_by', 'actions'
        ],
        columnsShow: {
          min: ['name', 'username', 'actions'],
          default: [
            'name', 'username', 'groups_display', 'total_role_display',
            'source', 'is_valid', 'actions'
          ]
        },
        columnsMeta: {
          username: {
            showOverflowTooltip: true
          },
          email: {
            showOverflowTooltip: true
          },
          source: {
            width: '120px'
          },
          total_role_display: {
            label: this.$t('users.Role'),
            showOverflowTooltip: true
          },
          groups_display: {
            width: '200px',
            showOverflowTooltip: true
          },
          actions: {
            formatterArgs: {
              hasDelete: () => this.currentOrgIsRoot,
              canUpdate: function(row, cellValue) {
                return row.can_update
              },
              canDelete: function(row, cellValue) {
                return row.can_delete
              },
              extraActions: [
                {
                  title: this.$t('users.Remove'),
                  name: 'remove',
                  type: 'warning',
                  has: () => !this.currentOrgIsRoot,
                  can: function(row, cellValue) {
                    return row.can_delete
                  },
                  callback: this.removeUserFromOrg
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasBulkDelete: false,
        canCreate: true,
        extraActions: [
          {
            name: this.$t('users.InviteUser'),
            title: this.$t('users.InviteUser'),
            has:
              (JSON.parse(this.$cookie.get('jms_current_org'))
                ? JSON.parse(this.$cookie.get('jms_current_org')).id
                : '') !== 'DEFAULT',
            callback: function() { this.InviteDialogSetting.InviteDialogVisible = true }.bind(this)
          }
        ],
        extraMoreActions: [
          {
            title: this.$t('common.deleteSelected'),
            name: 'deleteSelected',
            can({ selectedRows }) {
              return selectedRows.length > 0
            },
            callback: this.bulkDeleteCallback.bind(this)
          },
          {
            name: 'disableSelected',
            title: this.$t('common.disableSelected'),
            can({ selectedRows }) {
              return selectedRows.length > 0
            },
            callback({ selectedRows, reloadTable }) {
              const url = '/api/v1/users/users/'
              const data = selectedRows.map(row => {
                return { id: row.id, is_active: false }
              })
              if (data.length === 0) {
                return
              }
              vm.$axios.patch(url, data).then(() => {
                reloadTable()
              })
            }
          },
          {
            name: 'activateSelected',
            title: this.$t('common.activateSelected'),
            can: ({ selectedRows }) => selectedRows.length > 0,
            callback: ({ selectedRows, reloadTable }) => {
              const url = '/api/v1/users/users/'
              const data = selectedRows.map(row => {
                return { id: row.id, is_active: true }
              })
              if (data.length === 0) {
                return
              }
              vm.$axios.patch(url, data).then(() => {
                reloadTable()
              })
            }
          },
          {
            name: 'updateSelected',
            title: this.$t('common.updateSelected'),
            can: ({ selectedRows }) => selectedRows.length > 0,
            callback: ({ selectedRows, reloadTable }) => {
              vm.updateSelectedDialogSetting.dialogSetting.dialogVisible = true
              vm.updateSelectedDialogSetting.selectedRows = selectedRows
            }
          }
        ]
      },
      updateSelectedDialogSetting: {
        selectedRows: [],
        dialogSetting: {
          dialogVisible: false
        },
        formSetting: {
          initial: {
            date_expired: getDayFuture(36500, new Date()).toISOString()
          },
          fields: ['groups', 'date_expired', 'comment'],
          hasSaveContinue: false,
          url: '/api/v1/users/users/',
          fieldsMeta: {
            groups: {
              label: this.$t('users.UserGroups'),
              hidden: () => false,
              el: {
                multiple: true,
                ajax: {
                  url: '/api/v1/users/groups/'
                },
                value: []
              }
            },
            date_expired: {
              label: this.$t('common.dateExpired'),
              hidden: () => false
            },
            comment: {
              label: this.$t('common.Comment'),
              hidden: () => false
            }
          }
        }
      },
      InviteDialogSetting: {
        InviteDialogVisible: false
      }
    }
  },
  computed: {
    ...mapGetters(['currentOrgIsRoot', 'currentUser', 'device'])
  },
  mounted() {
    if (!this.currentOrgIsRoot) {
      this.headerActions.extraMoreActions[0].title = this.$t(
        'common.removeSelected'
      )
    }
  },
  methods: {
    removeUserFromOrg({ row, col, reload }) {
      const msg =
        this.$t('users.removeFromOrgWarningMsg') + ' "' + row.name + '"'
      const title = this.$t('common.Info')
      const performDelete = function() {
        const url = `/api/v1/users/users/${row.id}/`
        return this.$axios.delete(url)
      }
      this.$alert(msg, title, {
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        showCancelButton: true,
        beforeClose: async(action, instance, done) => {
          if (action !== 'confirm') return done()
          instance.confirmButtonLoading = true
          try {
            await performDelete.bind(this)({ row: row, col: col })
            done()
            reload()
            this.$message.success(this.$t('common.removeSuccessMsg'))
          } catch (error) {
            this.$message.error(this.$t('common.removeErrorMsg' + ' ' + error))
          } finally {
            instance.confirmButtonLoading = false
          }
        }
      })
    },
    bulkDeleteCallback({ selectedRows, reloadTable }) {
      let msgPrefix = this.$t('common.deleteWarningMsg')
      if (!this.currentOrgIsRoot) {
        msgPrefix = this.$t('common.removeWarningMsg')
      }
      const msg =
        msgPrefix +
        ' ' +
        selectedRows.length +
        ' ' +
        this.$t('common.rows') +
        ' ?'
      const title = this.$t('common.Info')
      const performDelete = this.performBulkDelete
      this.$alert(msg, title, {
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        showCancelButton: true,
        beforeClose: async(action, instance, done) => {
          if (action !== 'confirm') return done()
          instance.confirmButtonLoading = true
          try {
            await performDelete(selectedRows)
            done()
            reloadTable()
            let successMsg = this.$t('common.bulkDeleteSuccessMsg')
            if (!this.currentOrgIsRoot) {
              successMsg = this.$t('common.bulkRemoveSuccessMsg')
            }
            this.$message.success(successMsg)
          } catch (error) {
            // let errorMsg = this.$t('common.bulkDeleteErrorMsg')
            // if (!this.currentOrgIsRoot) {
            //   errorMsg = this.$t('common.bulkRemoveErrorMsg')
            // }
            // this.$message.error(errorMsg + error)
          } finally {
            instance.confirmButtonLoading = false
          }
        }
      }).catch(() => {
        /* 取消*/
      })
    },
    async performBulkDelete(selectedRows) {
      const ids = selectedRows.map(v => {
        return v.id
      })
      const data = await createSourceIdCache(ids)
      const url = `${this.tableConfig.url}?spm=` + data.spm
      return this.$axios.delete(url)
    },
    handleInviteDialogClose() {
      this.InviteDialogSetting.InviteDialogVisible = false
      this.$refs.GenericListPage.$refs.ListTable.reloadTable()
    },
    handleDialogUpdate() {
      this.$refs.GenericListPage.$refs.ListTable.reloadTable()
    }
  }
}
</script>

<style lang="less" scoped>
.asset-select-dialog ::v-deep .transition-box:first-child {
  background-color: #f3f3f3;
}
.dialog ::v-deep .el-input {
  width: 25.5vw;
}

.dialog ::v-deep .el-dialog__footer {
  padding: 0;
}
</style>
