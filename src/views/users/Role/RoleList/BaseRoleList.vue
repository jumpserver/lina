<template>
  <DrawerListTable
    ref="ListTable"
    :create-drawer="createDrawer"
    :header-actions="headerActions"
    :table-config="tableConfig"
  />
</template>

<script>
import { DrawerListTable } from '@/components'
import { DetailFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'BaseRoleList',
  components: {
    DrawerListTable
  },
  props: {
    scope: {
      type: String,
      default: 'system'
    }
  },
  data() {
    const scopeRole = this.scope + 'role'
    const vm = this
    return {
      loading: true,
      scopeRole: scopeRole,
      createDrawer: () => import('@/views/users/Role/RoleCreateUpdate.vue'),
      tableConfig: {
        url: `/api/v1/rbac/${this.scope}-roles/`,
        columnsExclude: ['name', 'permissions'],
        columnsShow: {
          min: ['display_name', 'action'],
          default: ['display_name', 'users_amount', 'builtin', 'comment', 'actions']
        },
        columnsMeta: {
          display_name: {
            formatter: DetailFormatter,
            formatterArgs: {
              permissions: [`rbac.view_${scopeRole}`],
              getRoute({ row }) {
                return {
                  name: 'RoleDetail',
                  query: {
                    scope: row.scope.value
                  },
                  params: {
                    id: row.id
                  }
                }
              }
            }
          },
          users_amount: {
            formatter: DetailFormatter,
            formatterArgs: {
              getRoute({ row }) {
                return {
                  name: 'RoleDetail',
                  query: {
                    tab: 'RoleUsers',
                    scope: row.scope.value
                  },
                  params: {
                    id: row.id
                  }
                }
              }
            }
          },
          builtin: {
            width: '150px',
            formatterArgs: {
              showFalse: false
            }
          },
          actions: {
            formatterArgs: {
              canUpdate: ({ row }) => {
                return this.hasPermNotBuiltin(row, `rbac.change_${row.scope?.value}role`)
              },
              canDelete: ({ row }) => {
                return this.hasPermNotBuiltin(row, `rbac.delete_${row.scope?.value}role`)
              },
              updateRoute: {
                name: 'RoleUpdate',
                query: {
                  'scope': this.scope
                }
              },
              canClone: ({ row }) => {
                return this.$hasPerm(`rbac.add_${row.scope?.value}role`)
              },
              onClone: ({ row }) => {
                this.$refs.ListTable.onClone({ row, query: { scope: row.scope?.value }})
              },
              onUpdate: ({ row }) => {
                this.$refs.ListTable.onUpdate({ row, query: { scope: row.scope?.value }})
              }
            }
          }
        }
      },
      headerActions: {
        onCreate: () => {
          this.$refs.ListTable.onCreate({ query: { scope: vm.scope }})
        },
        searchConfig: {
          exclude: ['scope']
        },
        hasMoreActions: false,
        canCreate: () => {
          return this.$hasPerm(`rbac.add_${this.scopeRole}`)
        },
        importOptions: {
          canImportUpdate: false
        }
      }
    }
  },
  methods: {
    hasPermNotBuiltin(row, perm) {
      return !row['builtin'] && this.$hasPerm(perm)
    },
    reloadTable() {
      this.$refs.ListTable.reloadTable()
    }
  }
}
</script>
