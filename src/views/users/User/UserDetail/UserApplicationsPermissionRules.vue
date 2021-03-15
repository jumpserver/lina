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
        url: `/api/v1/perms/application-permissions/?user_id=${this.object.id}&draw=1`,
        columns: [
          'name', 'category_display', 'users_amount', 'user_groups_amount',
          'applications_amount', 'system_users_amount',
          'is_valid', 'actions'
        ],
        columnsMeta: {
          name: {
            formatterArgs: {
              route: 'ApplicationPermissionDetail'
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
          applications_amount: {
            label: this.$t('assets.Applications'),
            width: '110px'
          },
          system_users_amount: {
            label: this.$t('assets.SystemUsers'),
            width: '110px'
          },
          actions: {
            formatterArgs: {
              onUpdate: ({ row, col, cellValue }) => {
                this.$router.push({ name: 'ApplicationPermissionUpdate', params: { id: row.id }})
              },
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/perms/application-permissions/${id}/?user_id=${this.object.id}&draw=1`
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
