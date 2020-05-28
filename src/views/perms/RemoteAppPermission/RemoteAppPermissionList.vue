<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter } from '@/components/ListTable/formatters'

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
            label: this.$t('users.Users'),
            formatter: DetailFormatter,
            routeQuery: {
              activeTab: 'RemoteAppPermissionUser'
            }
          },
          user_groups_amount: {
            label: this.$t('users.UserGroups'),
            formatter: DetailFormatter,
            routeQuery: {
              activeTab: 'RemoteAppPermissionUser'
            }
          },
          remote_apps_amount: {
            label: this.$t('assets.RemoteApps'),
            formatter: DetailFormatter,
            routeQuery: {
              activeTab: 'RemoteAppPermissionRemoteApp'
            }
          },
          system_users_amount: {
            label: this.$t('assets.SystemUsers'),
            formatter: DetailFormatter,
            routeQuery: {
              activeTab: 'RemoteAppPermissionRemoteApp'
            }
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
