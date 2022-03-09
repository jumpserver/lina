<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/users/groups/',
        columns: [
          'name', 'users_amount', 'date_created', 'created_by',
          'org_name', 'comment', 'actions'
        ],
        columnsShow: {
          default: ['name', 'users_amount', 'comment', 'actions'],
          min: ['name', 'action']
        },
        columnsMeta: {
          users_amount: {
            label: this.$t('users.Users'),
            width: '120px'
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
