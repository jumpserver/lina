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
        columnsExclude: ['rules'],
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
          reviewers_amount: {
            label: this.$t('common.ApproverNumbers')
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
