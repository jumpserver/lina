<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" :title="title" />
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
      title: this.$t('perms.RemoteAppPermission'),
      tableConfig: {
        url: '/api/v1/perms/remote-app-permissions/',
        columns: [
          'name', 'users_amount', 'user_groups_amount',
          'remote_apps_amount', 'system_users_amount',
          'is_valid', 'actions'
        ],
        columnsMeta: {
          name: {
            formatterArgs: {
              routeQuery: {
                activeTab: 'RemoteAppPermissionDetail'
              }
            },
            showOverflowTooltip: true
          },
          users_amount: {
            label: this.$t('users.Users'),
            width: '110px',
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'RemoteAppPermissionUser'
              }
            }
          },
          user_groups_amount: {
            label: this.$t('users.UserGroups'),
            width: '110px',
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'RemoteAppPermissionUser'
              }
            }
          },
          remote_apps_amount: {
            label: this.$t('assets.RemoteApps'),
            width: '110px',
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'RemoteAppPermissionRemoteApp'
              }
            }
          },
          system_users_amount: {
            label: this.$t('assets.SystemUsers'),
            width: '110px',
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'RemoteAppPermissionRemoteApp'
              }
            }
          }
        }
      },
      headerActions: {
        hasBulkDelete: false
      }
    }
  }
}
</script>

<style>

</style>
