<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import ListTable from '@/components/ListTable'
export default {
  name: 'UserRemoteAppPermissionRules',
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
        url: `/api/v1/perms/remote-app-permissions/?user_id=${this.object.id}&draw=1`,
        columns: ['name', 'users', 'user_groups', 'remote_apps', 'system_users', 'is_valid', 'actions'],
        columnsMeta: {
          name: {
            route: 'RemoteAppPermissionDetail'
          },
          users: {
            label: this.$t('users.Users'),
            formatter(row, col, colValue) {
              return colValue.length
            }
          },
          user_groups: {
            label: this.$t('users.UserGroups'),
            formatter(row, col, colValue) {
              return colValue.length
            }
          },
          remote_apps: {
            label: this.$t('assets.RemoteApps'),
            formatter(row, col, colValue) {
              return colValue.length
            }
          },
          system_users: {
            label: this.$t('assets.SystemUsers'),
            formatter(row, col, colValue) {
              return colValue.length
            }
          },
          actions: {
            formatterArgs: {
              detailRoute: 'RemoteAppPermissionDetail',
              updateRoute: 'RemoteAppPermissionUpdate'
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
