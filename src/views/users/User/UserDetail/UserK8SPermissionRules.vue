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
        url: `/api/v1/perms/k8s-app-permissions/?user_id=${this.object.id}&draw=1`,
        columns: ['name', 'users_amount', 'user_groups_amount', 'k8s_apps_amount', 'system_users_amount', 'is_valid', 'actions'],
        columnsMeta: {
          name: {
            formatterArgs: {
              route: 'KubernetesAppPermissionDetail'
            }
          },
          users_amount: {
            label: this.$t('users.Users')
          },
          user_groups_amount: {
            label: this.$t('users.UserGroups')
          },
          k8s_apps_amount: {
            label: this.$t('perms.KubernetesApp')
          },
          system_users_amount: {
            label: this.$t('assets.SystemUsers')
          },
          actions: {
            formatterArgs: {
              updateRoute: 'KubernetesAppPermissionUpdate',
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/perms/k8s-app-permissions/${id}/?user_id=${this.object.id}&draw=1`
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
