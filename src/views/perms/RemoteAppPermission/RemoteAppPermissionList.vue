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
        url: '/api/v1/perms/remote-app-permissions/',
        columns: [
          'name', 'users_amount', 'user_groups_amount',
          'remote_apps_amount', 'system_users_amount',
          'is_valid', 'actions'
        ],
        columnsMeta: {
          users_amount: {
            label: this.$t('users.Users')
          },
          user_groups_amount: {
            label: this.$t('users.UserGroups')
          },
          remote_apps_amount: {
            label: this.$t('assets.RemoteApps')
          },
          system_users_amount: {
            label: this.$t('assets.SystemUsers')
          }
        }
      },
      headerActions: {
        hasExport: false,
        hasImport: false,
        hasRefresh: false,
        hasBulkDelete: false
      }
    }
  }
}
</script>

<style>

</style>
