<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { ExpandPreFormatter } from '@/components/ListTable/formatters'

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
            label: this.$t('users.Users')
          },
          name: {
            type: 'expand',
            formatter: ExpandPreFormatter
          }
        },
        detailRoute: 'UserGroupDetail'
      },
      headerActions: {
        createRoute: 'UserGroupCreate',
        performBulkDelete: function(rows) {
          console.log('hello')
        }
      },
      helpMessage: '用户列表'
    }
  }
}
</script>

<style>

</style>
