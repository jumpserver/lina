<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'

export default {
  components: {
    GenericListTable
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/acls/login-acls/?user=${this.$route.params.id}`,
        columns: ['name', 'ip_group', 'priority', 'action', 'is_active', 'comment', 'actions'],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'ip_group', 'priority', 'action', 'is_active', 'comment', 'actions']
        },
        columnsMeta: {
          name: {
            formatterArgs: {
              route: 'UserAclDetail',
              routeQuery: {
                user: this.$route.params.id
              }
            }
          },
          action: {
            prop: 'action_display'
          },
          actions: {
            formatterArgs: {
              hasClone: false,
              updateRoute: { name: 'UserAclUpdate', query: { user: this.$route.params.id }},
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/acls/login-acls/${id}/?user=${this.$route.params.id}`
                return this.$axios.delete(url)
              }
            }
          }
        }
      },
      headerActions: {
        createRoute: { name: 'UserAclCreate', query: { user: this.$route.params.id }},
        hasRefresh: true,
        hasExport: false,
        hasImport: false,
        hasMoreActions: false
      }
    }
  }
}
</script>

<style>

</style>
