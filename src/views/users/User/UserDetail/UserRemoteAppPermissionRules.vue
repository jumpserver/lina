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
        columns: ['name', 'users_amount', 'user_groups_amount', 'remote_apps_amount', 'system_users_amount', 'is_valid', 'actions'],
        columnsMeta: {
          name: {
            formatterArgs: {
              route: 'RemoteAppPermissionDetail'
            },
            showOverflowTooltip: true
          },
          users_amount: {
            label: this.$t('users.Users'),
            width: '110px'
          },
          user_groups_amount: {
            label: this.$t('users.UserGroups'),
            width: '110px'
          },
          remote_apps_amount: {
            label: this.$t('assets.RemoteApps'),
            width: '110px'
          },
          system_users_amount: {
            label: this.$t('assets.SystemUsers'),
            width: '110px'
          },
          actions: {
            formatterArgs: {
              updateRoute: 'RemoteAppPermissionUpdate',
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/perms/remote-app-permissions/${id}/?user_id=${this.object.id}&draw=1`
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
