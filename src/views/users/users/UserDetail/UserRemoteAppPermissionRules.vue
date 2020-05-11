<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { ListTable } from '@/components'

export default {
  name: 'UserGrantedRemoteApps',
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
          remote_apps: {
            formatter(row, col, colValue) {
              return colValue.length
            }
          },
          system_users: {
            formatter(row, col, colValue) {
              return colValue.length
            }
          },
          actions: {
            detailRoute: 'RemoteAppPermissionDetail',
            updateRoute: 'RemoteAppPermissionUpdate'
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
