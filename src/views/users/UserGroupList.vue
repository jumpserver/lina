<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import DetailFormatter from '@/components/DataTable/formatters/DetailFormatter'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/users/groups/',
        columns: [
          {
            prop: 'name',
            label: this.$tc('Name'),
            key: 'name',
            formatter: DetailFormatter,
            sortable: true,
            route: 'UserDetail'
          },
          {
            prop: 'users_amount',
            label: this.$t('users.User'),
            key: 'users_amount'
          },
          {
            prop: 'comment',
            label: this.$tc('Comment'),
            key: 'comment',
            showOverflowTooltip: true
          }
        ],
        // 写路由名字，table组件会自动传作为参数
        tableActions: {
          hasEdit: true,
          editRoute: '404'
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
