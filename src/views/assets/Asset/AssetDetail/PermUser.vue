<template>
  <div>
    <el-row :gutter="20">
      <el-col :md="16" :sm="24">
        <ListTable ref="ListTable" :table-config="tableConfig" :header-actions="headerActions" />
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
import ListTable from '@/components/ListTable'
import { GenericListTableDialog } from '@/layout/components'
import { ChoicesFormatter, DetailFormatter } from '@/components/TableFormatters'
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
          'groups_display', 'total_role_display', 'source',
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
            },
            showOverflowTooltip: true
          },
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
            'name',
            'users_amount', 'user_groups_amount', 'assets_amount', 'nodes_amount',
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
              },
              showOverflowTooltip: true
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
            from_ticket: {
              width: 100,
              formatter: ChoicesFormatter,
              formatterArgs: {
                showFalse: false
              }
            },
            created_by: {
              showOverflowTooltip: true
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
            },
            nodes_amount: {
              label: this.$t('perms.Node'),
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
          hasColumnSetting: false
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
