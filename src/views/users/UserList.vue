<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter, DisplayFormatter, ChoicesFormatter, ActionsFormatter } from '@/components/ListTable/formatters/index'

export default {
  components: {
    GenericListPage,
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/users/users/',
        columns: [
          {
            prop: 'name',
            label: this.$tc('Name'),
            formatter: DetailFormatter,
            sortable: 'custom',
            route: 'UserDetail'
          },
          {
            prop: 'username',
            label: this.$t('users.Username'),
            sortable: 'custom',
          },
          {
            prop: 'role',
            label: this.$t('users.Role'),
            formatter: DisplayFormatter,
            sortable: 'custom',
          },
          {
            prop: 'groups_display',
            label: this.$t('users.User Groups')
          },
          {
            prop: 'source',
            label: this.$tc('Source'),
            sortable: 'custom',
            formatter: DisplayFormatter
          },
          {
            prop: 'is_valid',
            label: this.$tc('Status'),
            formatter: ChoicesFormatter,
            align: 'center',
            width: '80px'
          },
          {
            prop: 'id',
            label: this.$tc('Actions'),
            align: 'center',
            formatter: ActionsFormatter,
            width: '200px',
            actions: {
              updateRoute: 'UserUpdate',
              extraActions: [
                {
                  name: 'run',
                  title: this.$tc('Run')
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
        createRoute: 'UserCreate',
        extraMoreActions: [
          {
            name: 'deactiveSelected',
            title: this.$tc('Deactive selected')
          },
          {
            name: 'activeSelected',
            title: this.$tc('Active selected')
          }
        ]
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
