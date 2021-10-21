<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import { ArrayFormatter } from '@/components/TableFormatters'

export default {
  components: {
    GenericListTable
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/acls/login-acls/?user=${this.$route.params.id}`,
        columns: ['name', 'reviewers', 'priority', 'user_display', 'action', 'is_active', 'comment', 'actions'],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'priority', 'is_active', 'user_display', 'action', 'comment', 'actions']
        },
        columnsMeta: {
          name: {
            formatterArgs: {
              route: 'UserLoginACLDetail',
              routeQuery: {
                user: this.$route.params.id
              }
            }
          },
          ip_group: {
            formatter: ArrayFormatter,
            showOverflowTooltip: true
          },
          action: {
            prop: 'action_display'
          },
          reviewers: {
            prop: 'reviewers_amount'
          },
          actions: {
            formatterArgs: {
              hasClone: false,
              updateRoute: { name: 'UserLoginACLUpdate', query: { user: this.$route.params.id }},
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
        createRoute: { name: 'UserLoginACLCreate', query: { user: this.$route.params.id }},
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
