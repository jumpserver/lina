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
      :visible.sync="updateSelectedDialogSetting.visible"
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
import InviteUsersDialog from './components/InviteUsersDialog'

export default {
  components: {
    InviteUsersDialog,
    GenericListPage,
    GenericUpdateFormDialog
  },
  data() {
    const vm = this
    const hasDelete = () => {
      return vm.$hasPerm('users.delete_user')
    }
    const hasRemove = () => {
      if (!vm.publicSettings['XPACK_LICENSE_IS_VALID']) {
        return false
      }
      return !vm.currentOrgIsRoot
    }
    return {
      tableConfig: {
        url: '/api/v1/users/users/',
        permissions: {
          resource: 'user'
        },
        columns: [
          'name', 'username', 'email', 'phone', 'wechat',
          'groups_display', 'system_roles', 'org_roles',
          'source', 'is_valid', 'login_blocked', 'mfa_enabled',
          'mfa_force_enabled', 'is_expired',
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
          system_roles: {
            label: this.$t('users.SystemRoles'),
            showOverflowTooltip: true,
            formatter: (row) => {
              return row['system_roles_display']
            },
            filters: [],
            columnKey: 'system_roles'
          },
          org_roles: {
            label: this.$t('users.OrgRoles'),
            showOverflowTooltip: true,
            formatter: (row) => {
              return row['org_roles_display']
            },
            filters: [],
            columnKey: 'org_roles',
            has: () => {
              return this.$store.getters.hasValidLicense
            }
          },
          mfa_enabled: {
            label: 'MFA',
            formatterArgs: {
              showFalse: false
            }
          },
          mfa_force_enabled: {
            formatterArgs: {
              showFalse: false
            }
          },
          is_expired: {
            formatterArgs: {
              showFalse: false
            }
          },
          groups_display: {
            width: '200px',
            showOverflowTooltip: true
          },
          actions: {
            formatterArgs: {
              hasDelete: hasDelete,
              extraActions: [
                {
                  title: this.$t('users.Remove'),
                  name: 'remove',
                  type: 'warning',
                  has: hasRemove,
                  can: vm.$hasPerm('users.remove_user'),
                  callback: this.removeUserFromOrg
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasBulkDelete: hasDelete,
        canCreate: this.$hasPerm('users.add_user'),
        extraActions: [
          {
            name: this.$t('users.InviteUser'),
            title: this.$t('users.InviteUser'),
            has: () => {
              return !this.currentOrgIsRoot && this.publicSettings.XPACK_LICENSE_IS_VALID
            },
            can: () => vm.$hasPerm('users.invite_user'),
            callback: function() { this.InviteDialogSetting.InviteDialogVisible = true }.bind(this)
          }
        ],
        extraMoreActions: [
          {
            title: this.$t('common.removeSelected'),
            name: 'removeSelected',
            has: hasRemove,
            can: ({ selectedRows }) => selectedRows.length > 0 && vm.$hasPerm('users.change_user'),
            callback: this.bulkRemoveCallback.bind(this)
          },
          {
            name: 'disableSelected',
            title: this.$t('common.disableSelected'),
            can: ({ selectedRows }) => selectedRows.length > 0 && vm.$hasPerm('users.change_user'),
            callback: ({ selectedRows, reloadTable }) => vm.bulkActionCallback(selectedRows, reloadTable, 'disable')
          },
          {
            name: 'activateSelected',
            title: this.$t('common.activateSelected'),
            can: ({ selectedRows }) => selectedRows.length > 0 && vm.$hasPerm('users.change_user'),
            callback: ({ selectedRows, reloadTable }) => vm.bulkActionCallback(selectedRows, reloadTable, 'activate')
          },
          {
            name: 'actionUpdateSelected',
            title: this.$t('common.updateSelected'),
            can: ({ selectedRows }) => selectedRows.length > 0 &&
              !vm.currentOrgIsRoot &&
              vm.$hasPerm('users.change_user'),
            callback: ({ selectedRows, reloadTable }) => {
              vm.updateSelectedDialogSetting.visible = true
              vm.updateSelectedDialogSetting.selectedRows = selectedRows
            }
          }
        ]
      },
      updateSelectedDialogSetting: {
        selectedRows: [],
        visible: false,
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
  mounted() {
    this.setRolesFilter()
  },
  methods: {
    setRolesFilter() {
      const roleTypes = [{ name: 'system-roles', perm: 'systemrole' }, { name: 'org-roles', perm: 'orgrole' }]
      for (const roleType of roleTypes) {
        if (this.$hasPerm(`rbac.${roleType.perm}`)) {
          this.$axios.get(`/api/v1/rbac/${roleType}/`).then((roles) => {
            const fieldName = roleType.name.replace('-', '_')
            this.tableConfig.columnsMeta[fieldName].filters = roles.map(r => {
              return { text: r['display_name'], value: r.id }
            })
          })
        }
      }
    },
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
    bulkActionCallback(selectedRows, reloadTable, actionType) {
      const vm = this
      const url = '/api/v1/users/users/'
      const data = selectedRows.map(row => {
        return { id: row.id, is_active: actionType === 'activate' }
      })
      if (data.length === 0) return
      this.$axios.patch(url, data).then(() => {
        reloadTable()
        vm.$message.success(vm.$t(`common.${actionType}SuccessMsg`))
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

.dialog ::v-deep .el-dialog__footer {
  padding: 0;
}
</style>
