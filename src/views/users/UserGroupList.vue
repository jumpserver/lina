<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter, ActionsFormatter } from '@/components/DataTable/formatters/index'

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
            showOverflowTooltip: true
          },
          {
            prop: 'id',
            label: this.$tc('Action'),
            align: 'center',
            formatter: ActionsFormatter,
            actions: {
              hasDelete: true,
              hasUpdate: (row, cellValue) => {
                return true
              },
              canDelete: (row, cellValue) => {
                return false
              },
              canUpdate: (row, cellValue) => {},
              extraActions: [
                {
                  name: 'run',
                  title: this.$tc('Run')
                },
                {
                  name: 'monitor',
                  title: this.$tc('Monitor')
                }
              ]
            }
          }
        ],
        // 写路由名字，table组件会自动传作为参数
        tableActions: {
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
