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
    const hasDelete = () => {
      return vm.currentUserIsSuperAdmin
    }
    const hasRemove = () => {
      if (!vm.publicSettings.XPACK_LICENSE_IS_VALID) {
        return false
      }
      return !vm.currentOrgIsRoot
    }
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
              canClone: true,
              hasDelete: hasDelete,
              canUpdate: function({ row }) {
                return row.can_update
              },
              canDelete: function({ row }) {
                return row.can_delete
              },
              extraActions: [
                {
                  title: this.$t('users.Remove'),
                  name: 'remove',
                  type: 'warning',
                  has: hasRemove,
                  can: ({ row }) => {
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
        hasBulkDelete: hasDelete,
        canCreate: true,
        extraActions: [
          {
            name: this.$t('users.InviteUser'),
            title: this.$t('users.InviteUser'),
            has: () => {
              return !this.currentOrgIsRoot && this.publicSettings.XPACK_LICENSE_IS_VALID
            },
            callback: function() { this.InviteDialogSetting.InviteDialogVisible = true }.bind(this)
          }
        ],
        extraMoreActions: [
          {
            title: this.$t('common.removeSelected'),
            name: 'removeSelected',
            has: hasRemove,
            can({ selectedRows }) {
              return selectedRows.length > 0
            },
            callback: this.bulkRemoveCallback.bind(this)
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
            can: ({ selectedRows }) => selectedRows.length > 0 && !vm.currentOrgIsRoot,
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
              hidden: () => vm.currentOrgIsRoot,
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
    ...mapGetters([
      'currentOrgIsRoot', 'currentUser', 'publicSettings',
      'device', 'currentOrgIsDefault', 'currentUserIsSuperAdmin'
    ])
  },
  methods: {
    removeUserFromOrg({ row, col, reload }) {
      const url = `/api/v1/users/users/${row.id}/remove/`
      this.$axios.post(url).then(() => {
        reload()
        this.$message.success(this.$t('common.removeSuccessMsg'))
      })
    },
    async bulkRemoveCallback({ selectedRows, reloadTable }) {
      const ids = selectedRows.map(v => {
        return v.id
      })
      const data = await createSourceIdCache(ids)
      const url = `${this.tableConfig.url}remove/?spm=` + data.spm
      this.$axios.post(url).then(() => {
        reloadTable()
        this.$message.success(this.$t('common.removeSuccessMsg'))
      })
    },
    handleInviteDialogClose() {
      this.InviteDialogSetting.InviteDialogVisible = false
      this.$refs.GenericListPage.$refs.ListTable.$refs.ListTable.reloadTable()
    },
    handleDialogUpdate() {
      this.$refs.GenericListPage.$refs.ListTable.$refs.ListTable.reloadTable()
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
