<template>
  <div>
    <TwoCol>
      <template>
        <ListTable ref="ListTable" :header-actions="headerActions" :table-config="tableConfig" />
      </template>
      <template #right>
        <PermUserGroupCard v-bind="UserGroupCardConfig" />
      </template>
    </TwoCol>
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
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'PermUserList',
  components: {
    TwoCol,
    ListTable, GenericListTableDialog, PermUserGroupCard
  },
  props: {
    object: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: `/api/v1/assets/assets/${this.object.id}/perm-users/`,
        columns: [
          'name', 'username', 'email',
          'comment', 'created_by'
        ],
        columnsShow: {
          min: ['name', 'username'],
          default: ['name', 'username']
        },
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: true,
              can: vm.$hasPerm('users.view_user'),
              getRoute: ({ row }) => {
                return {
                  name: 'UserDetail',
                  params: { id: row.id }
                }
              }
            }
          },
          source: {
            width: '120px'
          },
          system_roles: {
            width: '100px',
            label: this.$t('SystemRoles'),
            formatter: (row) => {
              return row['system_roles'].map(item => item['display_name']).join(', ') || '-'
            },
            filters: [],
            columnKey: 'system_roles'
          },
          org_roles: {
            width: '100px',
            label: this.$t('OrgRoles'),
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
                  title: vm.$t('ViewPerm'),
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
        title: this.$t('UserGroups'),
        url: `/api/v1/assets/assets/${vm.object.id}/perm-user-groups/`,
        detailRoute: 'UserGroupDetail',
        buttonTitle: this.$t('ViewPerm'),
        buttonClickCallback(obj) {
          vm.GenericListTableDialogConfig.visible = true
          vm.GenericListTableDialogConfig.tableConfig.url = `/api/v1/assets/assets/${vm.object.id}/perm-user-groups/${obj.id}/permissions/`
        }
      },
      GenericListTableDialogConfig: {
        title: this.$t('Permissions'),
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
              label: this.$t('User'),
              width: '60px',
              formatter: DetailFormatter,
              formatterArgs: {
                route: 'AssetPermissionDetail',
                routeQuery: {
                  tab: 'AssetPermissionUser'
                }
              }
            },
            user_groups_amount: {
              label: this.$t('UserGroups'),
              width: '100px',
              formatter: DetailFormatter,
              formatterArgs: {
                route: 'AssetPermissionDetail',
                routeQuery: {
                  tab: 'AssetPermissionUser'
                }
              }
            },
            assets_amount: {
              label: this.$t('Asset'),
              width: '60px',
              formatter: DetailFormatter,
              formatterArgs: {
                route: 'AssetPermissionDetail',
                routeQuery: {
                  tab: 'AssetPermissionAsset'
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
  },
  watch: {
    $route: {
      handler(newVal) {
        newVal.fullPath.includes('/console/perms/asset-permissions/') && (this.GenericListTableDialogConfig.visible = false)
      }
    }
  }
}
</script>
