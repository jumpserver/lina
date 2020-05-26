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
        url: '/api/v1/perms/database-app-permissions/',
        columns: ['name', 'users_amount', 'user_groups_amount', 'database_apps_amount', 'system_users_amount', 'is_valid', 'actions'],
        columnsMeta: {
          users_amount: {
            label: this.$t('perms.User')
          },
          user_groups_amount: {
            label: this.$t('perms.UserGroups')
          },
          database_apps_amount: {
            label: this.$t('perms.databaseApp')
          },
          system_users_amount: {
            label: this.$t('perms.SystemUser')
          }
        }
      },
      headerActions: {
        hasRightActions: false,
        hasBulkDelete: false
      }
    }
  }
}
</script>

<style>

</style>
