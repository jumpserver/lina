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
        url: '/api/v1/acls/login-acls/',
        columns: ['name', 'users', 'ip_group', 'priority', 'action', 'comment', 'actions'],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'users', 'ip_group', 'priority', 'action', 'comment', 'actions']
        },
        columnsMeta: {
          users: {
            prop: 'users_amount',
            showOverflowTooltip: true
          }
        }
      },
      updateRoute: 'UserAclUpdate',
      headerActions: {
        createRoute: 'UserAclCreate',
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
