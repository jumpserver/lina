<template>
  <ListTable v-if="!loading" :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { ListTable } from '@/components'
import { DetailFormatter } from '@/components/TableFormatters'

export default {
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
    return {
      loading: true,
      scopeRole: scopeRole,
      tableConfig: {
        url: `/api/v1/rbac/${this.scope}-roles/`,
        columns: [
          'display_name', 'users_amount', 'builtin', 'created_by',
          'date_create', 'date_updated', 'comment', 'actions'
        ],
        columnsShow: {
          default: ['display_name', 'users_amount', 'builtin', 'comment', 'actions'],
          min: ['name', 'action']
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
                    scope: row.scope
                  },
                  params: {
                    id: row.id
                  }
                }
              }
            }
          },
          builtin: {
            formatterArgs: {
              showFalse: false
            }
          },
          actions: {
            formatterArgs: {
              canUpdate: ({ row }) => {
                return this.hasPermNotBuiltinNotRootOrg(row, `rbac.change_${row.scope}role`)
              },
              canDelete: ({ row }) => {
                return this.hasPermNotBuiltinNotRootOrg(row, `rbac.delete_${row.scope}role`)
              },
              updateRoute: {
                name: 'RoleUpdate',
                query: {
                  'scope': this.scope
                }
              },
              canClone: ({ row }) => {
                return this.$hasPerm(`rbac.add_${row.scope}role`)
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
        hasMoreActions: false,
        canCreate: () => {
          return this.$hasPerm(`rbac.add_${this.scopeRole}`)
        }
      }
    }
  },
  mounted() {
    setTimeout(() => {
      this.loading = false
    })
  },
  methods: {
    hasPermNotBuiltinNotRootOrg(row, perm) {
      return !row['builtin'] && this.$hasPerm(perm) && !this.$isRootOrg()
    }
  }
}
</script>

<style>

</style>
