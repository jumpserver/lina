<template>
  <div>
    <GenericListPage
      ref="GenericListPage"
      :create-drawer="createDrawer"
      :detail-drawer="detailDrawer"
      :header-actions="headerActions"
      :quick-filters="quickFilters"
      :table-config="tableConfig"
    />
    <GenericUpdateFormDialog
      v-if="updateSelectedDialogSetting.visible"
      :form-setting="updateSelectedDialogSetting.formSetting"
      :selected-rows="updateSelectedDialogSetting.selectedRows"
      :visible.sync="updateSelectedDialogSetting.visible"
      @update="handleDialogUpdate"
    />
    <InviteUsersDialog
      :setting="InviteDialogSetting"
      @close="handleInviteDialogClose"
    />
  </div>
</template>

<script>
import { createSourceIdCache } from '@/api/common'
import { GenericListPage, GenericUpdateFormDialog } from '@/layout/components'
import { mapGetters } from 'vuex'
import { getDayFuture } from '@/utils/time'
import InviteUsersDialog from './components/InviteUsersDialog'
import AmountFormatter from '@/components/Table/TableFormatters/AmountFormatter.vue'
import store from '@/store'
import { MFASystemSetting } from '../const'
import DetailFormatter from '@/components/Table/TableFormatters/DetailFormatter.vue'

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
      createDrawer: () => import('./UserCreateUpdate.vue'),
      detailDrawer: () => import('./UserDetail/index.vue'),
      quickFilters: [
        {
          label: this.$t('QuickFilter'),
          options: [
            {
              label: this.$t('Invalid'),
              filter: {
                is_valid: false
              }
            },
            {
              label: this.$t('Disabled'),
              filter: {
                is_active: false
              }
            },
            {
              label: this.$t('Expired'),
              filter: {
                is_expired: true
              }
            },
            {
              label: this.$t('NeverLogin'),
              filter: {
                is_first_login: true
              }
            }
          ]
        },
        {
          label: this.$t('Auth'),
          options: [
            {
              label: this.$t('PasswordExpired'),
              filter: {
                is_password_expired: true
              }
            },
            {
              label: this.$t('NoLoginLongTime'),
              filter: {
                is_long_time_no_login: true
              }
            },
            {
              label: this.$t('NoMFA'),
              filter: {
                mfa_level: 0
              }
            },
            {
              label: this.$t('LoginBlocked'),
              filter: {
                is_login_blocked: true
              }
            }
          ]
        }
      ],
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
            'name', 'username', 'email',
            'groups', 'is_valid', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                tab: 'Basic'
              },
              getRoute: ({ row }) => {
                return {
                  name: 'UserDetail',
                  params: {
                    id: row.id
                  }
                }
              }
            }
          },
          mfa_level: {
            width: '130px',
            formatter: (row) => {
              const securityMFAAuth = store.getters.publicSettings['SECURITY_MFA_AUTH']
              if (securityMFAAuth === MFASystemSetting.allUsers) {
                return this.$t('MFAAllUsers')
              } else if (securityMFAAuth === MFASystemSetting.onlyAdminUsers && (row?.is_superuser || row?.is_org_admin)) {
                return this.$t('MFAOnlyAdminUsers')
              } else {
                return row['mfa_level'].label
              }
            }
          },
          source: {
            width: '120px',
            collapsible: false
          },
          email: {
            'min-width': '160px'
          },
          'wecom_id': {
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
                tab: 'UserDetail'
              }
            }
          },
          system_roles: {
            formatter: (row) => {
              return row['system_roles'].map(item => item['display_name']).join(', ') || '-'
            },
            filters: [],
            columnKey: 'system_roles'
          },
          org_roles: {
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
            width: '120px',
            formatter: (row) => {
              const phoneObj = row.phone
              return phoneObj?.phone ? <div>{phoneObj?.code}{phoneObj?.phone}</div> : ''
            }
          },
          login_blocked: {
            width: '120px',
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
            width: '230px',
            formatterArgs: {
              showFalse: false
            }
          },
          date_password_last_updated: {
            width: '230px'
          },
          need_update_password: {
            width: '200px',
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
            formatterArgs: {
              hasDelete: hasDelete,
              canUpdate: ({ row }) => {
                return this.$hasPerm('users.change_user') &&
                  !(!this.currentUserIsSuperAdmin && row['is_superuser'])
              },
              extraActions: [
                {
                  title: this.$t('Remove'),
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
            name: this.$t('InviteUser'),
            title: this.$t('InviteUser'),
            has: () => {
              return !this.currentOrgIsRoot && this.publicSettings.XPACK_LICENSE_IS_VALID
            },
            can: () => vm.$hasPerm('users.invite_user'),
            callback: () => {
              this.InviteDialogSetting.InviteDialogVisible = true
            }
          }
          // {
          // name: this.$t('Roles'),
          // title: this.$t('Roles'),
          // has: () => {
          // return this.publicSettings.XPACK_LICENSE_IS_VALID &&
          // this.$hasPerm(['rbac.view_orgrole | rbac.view_systemrole'],)
          // },
          // callback: () => {
          // this.$router.push({ name: 'RoleList' })
          // }
          // }
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
            title: this.$t('RemoveSelected'),
            name: 'RemoveSelected',
            has: hasRemove,
            icon: 'remove',
            can: ({ selectedRows }) => selectedRows.length > 0 && vm.$hasPerm('users.remove_user'),
            callback: this.bulkRemoveCallback.bind(this)
          },
          {
            name: 'BatchDisable',
            title: this.$t('DisableSelected'),
            icon: 'fa fa-ban',
            can: ({ selectedRows }) => selectedRows.length > 0 && vm.$hasPerm('users.change_user'),
            callback: ({ selectedRows, reloadTable }) => vm.bulkActionCallback(selectedRows, reloadTable, 'disable')
          },
          {
            name: 'BatchActivate',
            title: this.$t('ActivateSelected'),
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
              label: this.$t('UserGroups'),
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
              label: this.$t('DateExpired'),
              hidden: () => false
            },
            comment: {
              label: this.$t('Comment'),
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
      this.$confirm(this.$t('RemoveWarningMsg') + ' ' + row.name + ' ?', this.$tc('Info'), {
        type: 'warning'
      }).then(() => {
        const url = `/api/v1/users/users/${row.id}/remove/`
        this.$axios.post(url).then(() => {
          reload()
          this.$message.success(this.$tc('RemoveSuccessMsg'))
        })
      }).catch(() => {
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
        this.$message.success(this.$tc('RemoveSuccessMsg'))
      })
    },
    reloadTable() {
      this.$refs.GenericListPage.reloadTable()
    },
    bulkActionCallback(selectedRows, reloadTable, actionType) {
      const msgs = {
        'disable': 'DisableSuccessMsg',
        'activate': 'ActivateSuccessMsg',
        'remove': 'RemoveSuccessMsg',
        'delete': 'DeleteSuccessMsg'
      }
      const vm = this
      const url = '/api/v1/users/users/'
      const data = selectedRows.map(row => {
        return { id: row.id, is_active: actionType === 'activate' }
      })
      if (data.length === 0) return
      this.$axios.patch(url, data).then(() => {
        reloadTable()
        vm.$message.success(vm.$t(msgs[actionType]))
      })
    },
    handleInviteDialogClose() {
      this.InviteDialogSetting.InviteDialogVisible = false
      this.reloadTable()
    },
    handleDialogUpdate() {
      this.updateSelectedDialogSetting.visible = false

      // 此处必须显示重新赋值才能在更新用户时使得 Groups 数据重新刷新
      this.tableConfig.columnsMeta.groups = {
        formatter: AmountFormatter,
        formatterArgs: {
          routeQuery: {
            tab: 'UserDetail'
          }
        }
      }
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
