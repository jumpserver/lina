<template>
  <div>
    <el-row :gutter="20">
      <el-col :md="16" :sm="24">
        <ListTable ref="ListTable" :header-actions="headerActions" :table-config="tableConfig" />
      </el-col>
      <el-col :md="8" :sm="24">
        <PermUserGroupCard v-bind="UserGroupCardConfig" />
      </el-col>
    </el-row>
    <GenericListTableDialog
      :visible.sync="GenericListTableDialogConfig.visible"
      v-bind="GenericListTableDialogConfig"
    />
  </div>
</template>

<script>
import ListTable from '@/components/Table/ListTable'
import { GenericListTableDialog } from '@/layout/components'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import PermUserGroupCard from './components/PermUserGroupCard'

export default {
  name: 'PermUserList',
  components: {
    ListTable, GenericListTableDialog, PermUserGroupCard
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: `/api/v1/assets/assets/${this.object.id}/perm-users/`,
        columns: [
          'name', 'username', 'email', 'phone', 'wechat',
          'groups_display', 'system_roles', 'org_roles', 'source',
          'is_valid', 'login_blocked', 'mfa_enabled',
          'mfa_force_enabled', 'is_expired',
          'last_login', 'date_joined', 'date_password_last_updated',
          'comment', 'created_by', 'actions'
        ],
        columnsShow: {
          min: ['name', 'username', 'actions'],
          default: [
            'name', 'username',
            'source', 'is_valid', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatter: vm.$hasPerm('users.view_user') ? DetailFormatter : '',
            formatterArgs: {
              route: 'UserDetail'
            }
          },
          source: {
            width: '120px'
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
            width: '200px'
          },
          actions: {
            formatterArgs: {
              hasUpdate: false,
              hasDelete: false,
              hasClone: false,
              extraActions: [
                {
                  title: vm.$t('assets.ViewPerm'),
                  name: 'view',
                  type: 'primary',
                  callback: function(data) {
                    vm.GenericListTableDialogConfig.visible = true
                    vm.GenericListTableDialogConfig.tableConfig.url = `/api/v1/assets/assets/${vm.object.id}/perm-users/${data.row.id}/permissions/`
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasImport: false,
        hasExport: false,
        hasLeftActions: false
      },
      UserGroupCardConfig: {
        icon: 'fa-users',
        title: this.$t('perms.UserGroups'),
        url: `/api/v1/assets/assets/${vm.object.id}/perm-user-groups/`,
        detailRoute: 'UserGroupDetail',
        buttonTitle: this.$t('assets.ViewPerm'),
        buttonClickCallback(obj) {
          vm.GenericListTableDialogConfig.visible = true
          vm.GenericListTableDialogConfig.tableConfig.url = `/api/v1/assets/assets/${vm.object.id}/perm-user-groups/${obj.id}/permissions/`
        }
      },
      GenericListTableDialogConfig: {
        title: this.$t('perms.Permissions'),
        visible: false,
        width: '60%',
        tableConfig: {
          url: '',
          columns: [
            'name', 'user_groups_amount', 'assets_amount',
            'is_valid', 'is_active', 'date_expired', 'comment', 'org_name', 'created_by', 'date_created'
          ],
          columnsShow: {
            min: ['name'],
            default: [
              'name', 'is_valid', 'created_by', 'date_created'
            ]
          },
          columnsMeta: {
            name: {
              formatterArgs: {
                route: 'AssetPermissionDetail'
              }
            },
            users_amount: {
              label: this.$t('perms.User'),
              width: '60px',
              formatter: DetailFormatter,
              formatterArgs: {
                route: 'AssetPermissionDetail',
                routeQuery: {
                  activeTab: 'AssetPermissionUser'
                }
              }
            },
            user_groups_amount: {
              label: this.$t('perms.UserGroups'),
              width: '100px',
              formatter: DetailFormatter,
              formatterArgs: {
                route: 'AssetPermissionDetail',
                routeQuery: {
                  activeTab: 'AssetPermissionUser'
                }
              }
            },
            assets_amount: {
              label: this.$t('perms.Asset'),
              width: '60px',
              formatter: DetailFormatter,
              formatterArgs: {
                route: 'AssetPermissionDetail',
                routeQuery: {
                  activeTab: 'AssetPermissionAsset'
                }
              }
            }
          }
        },
        headerActions: {
          hasImport: false,
          hasExport: false,
          hasLeftActions: false,
          hasColumnSetting: false,
          searchConfig: {
            getUrlQuery: false
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
