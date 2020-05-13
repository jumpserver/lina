<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { ListTable } from '@/components'

export default {
  name: 'UserDatabasePermissionRules',
  components: {
    ListTable
  },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/perms/database-app-permissions/?user_id=${this.object.id}&draw=1`,
        columns: ['name', 'users', 'user_groups', 'database_apps', 'system_users', 'is_valid', 'actions'],
        columnsMeta: {
          name: {
            route: 'DatabasePermissionDetail'
          },
          users: {
            label: this.$t('users.users'),
            formatter(row, col, colValue) {
              return colValue.length
            }
          },
          user_groups: {
            label: this.$t('users.userGroups'),
            formatter(row, col, colValue) {
              return colValue.length
            }
          },
          database_apps: {
            label: this.$t('assets.remoteApps'),
            formatter(row, col, colValue) {
              return colValue.length
            }
          },
          system_users: {
            label: this.$t('assets.systemUsers'),
            formatter(row, col, colValue) {
              return colValue.length
            }
          },
          actions: {
            updateRoute: 'DatabasePermissionUpdate'
          }
        }
      },
      headerActions: {
        hasLeftActions: false
      }
    }
  }
}
</script>

<style scoped>

</style>
