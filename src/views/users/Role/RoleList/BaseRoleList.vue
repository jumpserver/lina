<template>
  <ListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import { ListTable } from '@/components'
import { DetailFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'BaseRoleList',
  components: {
    ListTable
  },
  props: {
    scope: {
      type: String,
      default: 'org'
    }
  },
  data() {
    const scopeRole = this.scope + 'role'
    const vm = this
    return {
      loading: true,
      scopeRole: scopeRole,
      tableConfig: {
        url: `/api/v1/rbac/${this.scope}-roles/`,
        columnsExclude: ['name', 'permissions'],
        columnsShow: {
          min: ['display_name', 'action'],
          default: ['display_name', 'users_amount', 'builtin', 'comment', 'actions']
        },
        columnsMeta: {
          display_name: {
            label: this.$t('common.Name'),
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
                    activeTab: 'RoleUsers',
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
            width: '100px',
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
                return vm.$router.push({
                  name: 'RoleCreate',
                  query: {
                    scope: row.scope?.value,
                    clone_from: row.id
                  }
                })
              }
            }
          }
        }
      },
      headerActions: {
        createRoute: {
          name: 'RoleCreate',
          query: {
            scope: this.scope
          }
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
    }
  }
}
</script>

<style>

</style>
