<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
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
    return {
      tableConfig: {
        url: `/api/v1/rbac/roles/?scope=${this.scope}`,
        columns: [
          'name_display', 'users_amount', 'builtin', 'created_by',
          'date_create', 'date_updated', 'comment', 'actions'
        ],
        columnsShow: {
          default: ['name_display', 'users_amount', 'builtin', 'comment', 'actions'],
          min: ['name', 'action']
        },
        columnsMeta: {
          name_display: {
            label: this.$t('common.Name'),
            formatter: DetailFormatter,
            formatterArgs: {
              permissions: ['rbac.view_role']
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
                return this.hasPermNotBuiltinNotRootOrg(row, 'rbac.change_role')
              },
              canDelete: ({ row }) => {
                return this.hasPermNotBuiltinNotRootOrg(row, 'rbac.delete_role')
              },
              canClone: ({ row }) => {
                return this.hasPermNotBuiltinNotRootOrg(row, 'rbac.add_role')
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
          return this.$hasPerm(`rbac.add_${this.scope}role`)
        }
      }
    }
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
