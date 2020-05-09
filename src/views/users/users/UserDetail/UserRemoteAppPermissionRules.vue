<template>
  <IBox>
    <ListTable :table-config="tableConfig" :header-actions="headerActions" />
  </IBox>
</template>

<script>
import { IBox, ListTable } from '@/components'

export default {
  name: 'UserGrantedRemoteApps',
  components: {
    IBox,
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
          users: {
            label: this.$tt('users.users'),
            formatter(row, col, colValue) {
              return colValue.length
            }
          },
          user_groups: {
            label: this.$tt('users.userGroups'),
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
          }
        },
        actions: {
          detailRoute: 'RemoteAppDetail'
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
