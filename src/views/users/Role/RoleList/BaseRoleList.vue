<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { ListTable } from '@/components'

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
          'name', 'users_amount', 'builtin', 'created_by', 'date_create',
          'date_updated', 'comment', 'actions'
        ],
        columnsShow: {
          default: ['name', 'users_amount', 'builtin', 'comment', 'actions'],
          min: ['name', 'action']
        },
        columnsMeta: {
          name: {
            formatterArgs: {
              permissions: ['rbac.view_role']
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
        }
      }
    }
  },
  methods: {
    hasPermNotBuiltinNotRootOrg(row, perm) {
      return !row['builtin'] &&
          this.$hasPerm(perm) &&
          !this.$isRootOrg()
    }
  }
}
</script>

<style>

</style>
