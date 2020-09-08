<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import ListTable from '@/components/ListTable'

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
        columns: ['name', 'users_amount', 'user_groups_amount', 'database_apps_amount', 'system_users_amount', 'is_valid', 'actions'],
        columnsMeta: {
          name: {
            formatterArgs: {
              route: 'DatabaseAppPermissionDetail'
            }
          },
          users_amount: {
            label: this.$t('users.Users')
          },
          user_groups_amount: {
            label: this.$t('users.UserGroups')
          },
          database_apps_amount: {
            label: this.$t('assets.RemoteApps')
          },
          system_users_amount: {
            label: this.$t('assets.SystemUsers')
          },
          actions: {
            formatterArgs: {
              updateRoute: 'DatabaseAppPermissionUpdate',
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/perms/database-app-permissions/${id}/?user_id=${this.object.id}&draw=1`
                return this.$axios.delete(url)
              }
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasImport: false,
        hasExport: false
      }
    }
  }
}
</script>

<style scoped>

</style>
