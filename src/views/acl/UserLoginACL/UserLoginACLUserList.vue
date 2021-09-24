<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/acls/login-acls/`,
        columns: [
          'name', 'ip_group', 'reviewers', 'priority', 'user_display', 'is_active', 'comment', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'priority', 'is_active', 'user_display', 'comment', 'actions'
          ]
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
          reviewers: {
            prop: 'reviewers_amount'
          }
        }
      },
      updateRoute: 'UserLoginACLUpdate',
      headerActions: {
        createRoute: 'UserLoginACLCreate',
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
