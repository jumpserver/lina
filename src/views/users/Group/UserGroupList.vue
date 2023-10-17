<template>
  <div>
    <GenericListPage :header-actions="headerActions" :table-config="tableConfig" />
    <UserGroupCreateUpdate />
  </div>
</template>

<script>
import { GenericListPage } from '@/layout/components'
import AmountFormatter from '@/components/Table/TableFormatters/AmountFormatter.vue'
import UserGroupCreateUpdate from '@/views/users/Group/UserGroupCreateUpdate.vue'

export default {
  components: {
    UserGroupCreateUpdate,
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/users/groups/',
        columnsShow: {
          default: ['name', 'users', 'comment', 'actions'],
          min: ['name', 'action']
        },
        columnsMeta: {
          users_amount: {
            label: this.$t('users.Users'),
            width: '120px'
          },
          users: {
            label: this.$t('perms.User'),
            width: '160px',
            formatter: AmountFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'GroupUser'
              }
            }
          }
        },
        permissions: {
          app: 'users',
          resource: 'usergroup'
        }
      },
      headerActions: {
        createRoute: 'UserGroupCreate'
      }
    }
  }
}
</script>

<style>

</style>
