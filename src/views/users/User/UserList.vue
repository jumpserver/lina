<template>
  <div>
    <GenericListPage
      ref="GenericListPage"
      :header-actions="headerActions"
      :table-config="tableConfig"
    />
    <GenericUpdateFormDialog
      v-if="updateSelectedDialogSetting.visible"
      :form-setting="updateSelectedDialogSetting.formSetting"
      :selected-rows="updateSelectedDialogSetting.selectedRows"
      :visible.sync="updateSelectedDialogSetting.visible"
      @update="handleDialogUpdate"
    />
    <InviteUsersDialog :setting="InviteDialogSetting" @close="handleInviteDialogClose" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { GenericListPage, GenericUpdateFormDialog } from '@/layout/components'
import { createSourceIdCache } from '@/api/common'
import { getDayFuture } from '@/utils/common'
import InviteUsersDialog from './components/InviteUsersDialog'
import AmountFormatter from '@/components/Table/TableFormatters/AmountFormatter.vue'

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
        columnsExclude: [
          'password', 'password_strategy', 'public_key',
          'mfa_force_enabled', 'is_service_account', 'avatar_url'
        ],
        columnsShow: {
          min: ['name', 'username', 'actions'],
          default: [
            'name', 'username', 'email', 'groups', 'system_roles',
            'org_roles', 'source', 'is_valid', 'actions'
          ]
        },
        columnsMeta: {
          source: {
            width: '120px'
          },
          username: {
            formatter: (row) => {
              return row['username'].replace(' ', '*')
            }
          },
          groups: {
            formatter: AmountFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'UserDetail'
              }
            }
          },
          system_roles: {
            width: '100px',
            label: this.$t('users.SystemRoles'),
            formatter: (row) => {
              return row['system_roles'].map(item => item['display_name']).join(', ') || '-'
            },
            filters: [],
            columnKey: 'system_roles'
          },
          org_roles: {
            width: '100px',
            label: this.$t('users.OrgRoles'),
            formatter: (row) => {
              return row['org_roles'].map(item => item['display_name']).join(', ') || '-'
            },
            filters: [],
            columnKey: 'org_roles',
            has: () => {
              return this.$store.getters.hasValidLicense && !this.currentOrgIsRoot
            }
          },
          orgs_roles: {
            columnKey: 'orgs_roles',
            has: () => {
              return this.$store.getters.currentOrgIsRoot
            },
            formatter: AmountFormatter,
            filters: [],
            formatterArgs: {
              getItem(item) {
                return item.key + ': ' + item.value.join(', ')
              }
            }
          },
          phone: {
            formatter: (row) => {
              const phoneObj = row.phone
              return <div>{phoneObj?.code}{phoneObj?.phone}</div>
            }
          },
          login_blocked: {
            width: '90px',
            formatterArgs: {
              showFalse: false
            }
          },
          is_first_login: {
            formatterArgs: {
              showFalse: false
            }
          },
          can_public_key_auth: {
            width: '100px',
            formatterArgs: {
              showFalse: false
            }
          },
          need_update_password: {
            width: '100px',
            formatterArgs: {
              showFalse: false
            }
          },
          is_expired: {
            formatterArgs: {
              showFalse: false
            }
          },
          actions: {
            el: {
              fixed: 'right'
            },
            formatterArgs: {
              fixed: 'right',
              hasDelete: hasDelete,
              canUpdate: ({ row }) => {
                return this.$hasPerm('users.change_user') &&
                  !(!this.currentUserIsSuperAdmin && row['is_superuser'])
              },
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
        hasLabelSearch: true,
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
            callback: () => {
              this.InviteDialogSetting.InviteDialogVisible = true
            }
          }
        ],
        hasBulkUpdate: true,
        canBulkUpdate: ({ selectedRows }) => {
          return selectedRows.length > 0 &&
            vm.$hasPerm('users.change_user')
        },
        handleBulkUpdate: ({ selectedRows }) => {
          vm.updateSelectedDialogSetting.visible = true
          vm.updateSelectedDialogSetting.selectedRows = selectedRows
        },
        extraMoreActions: [
          {
            title: this.$t('common.BatchRemoval'),
            name: 'BatchRemoval',
            has: hasRemove,
            fa: 'remove',
            can: ({ selectedRows }) => selectedRows.length > 0 && vm.$hasPerm('users.remove_user'),
            callback: this.bulkRemoveCallback.bind(this)
          },
          {
            name: 'BatchDisable',
            title: this.$t('common.BatchDisable'),
            icon: 'fa fa-ban',
            can: ({ selectedRows }) => selectedRows.length > 0 && vm.$hasPerm('users.change_user'),
            callback: ({ selectedRows, reloadTable }) => vm.bulkActionCallback(selectedRows, reloadTable, 'disable')
          },
          {
            name: 'BatchActivate',
            title: this.$t('common.BatchActivate'),
            icon: 'fa fa-check-circle-o',
            can: ({ selectedRows }) => selectedRows.length > 0 && vm.$hasPerm('users.change_user'),
            callback: ({ selectedRows, reloadTable }) => vm.bulkActionCallback(selectedRows, reloadTable, 'activate')
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
              el: {
                multiple: true,
                disabled: vm.$store.getters.currentOrgIsRoot,
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
    removeUserFromOrg({ row, reload }) {
      const url = `/api/v1/users/users/${row.id}/remove/`
      this.$axios.post(url).then(() => {
        reload()
        this.$message.success(this.$tc('common.removeSuccessMsg'))
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
        this.$message.success(this.$tc('common.removeSuccessMsg'))
      })
    },
    reloadTable() {
      this.$refs.GenericListPage.reloadTable()
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
      this.reloadTable()
    },
    handleDialogUpdate() {
      this.updateSelectedDialogSetting.visible = false
      this.reloadTable()
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
