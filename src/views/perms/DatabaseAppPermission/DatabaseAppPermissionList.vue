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
        url: '/api/v1/perms/database-app-permissions/',
        columns: ['name', 'users_amount', 'user_groups_amount', 'database_apps_amount', 'system_users_amount', 'is_valid', 'actions'],
        columnsMeta: {
          name: {
            formatterArgs: {
              routeQuery: {
                activeTab: 'DatabaseAppPermissionDetail'
              }
            },
            showOverflowTooltip: true
          },
          users_amount: {
            label: this.$t('perms.User'),
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'DatabaseAppPermissionUser'
              }
            }
          },
          user_groups_amount: {
            label: this.$t('perms.UserGroups'),
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'DatabaseAppPermissionUser'
              }
            }
          },
          database_apps_amount: {
            label: this.$t('perms.databaseApp'),
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'DatabaseAppPermissionDatabaseApp'
              }
            }
          },
          system_users_amount: {
            label: this.$t('perms.SystemUser'),
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'DatabaseAppPermissionDatabaseApp'
              }
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
