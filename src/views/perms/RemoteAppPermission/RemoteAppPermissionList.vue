<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { LengthFormatter } from '@/components/ListTable/formatters/index'

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
            label: this.$t('users.users')
          },
          user_groups_amount: {
            label: this.$t('users.userGroups')
          },
          remote_apps_amount: {
            label: this.$t('assets.remoteApps')
          },
          system_users_amount: {
            formatter: LengthFormatter,
            label: this.$t('assets.systemUsers')
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
