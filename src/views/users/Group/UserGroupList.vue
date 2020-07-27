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
        columns: ['name', 'users_amount', 'comment', 'actions'],
        columnsMeta: {
          users_amount: {
            label: this.$t('users.Users'),
            width: '120px'
          }
        },
        detailRoute: 'UserGroupDetail'
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
