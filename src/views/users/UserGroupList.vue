<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter, ActionsFormatter } from '@/components/ListTable/formatters/index'

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
            route: 'UserGroupDetail'
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
            label: this.$tc('Actions'),
            align: 'center',
            formatter: ActionsFormatter,
            width: '200px',
            actions: {
              updateRoute: 'UserGroupUpdate',
              extraActions: [
                {
                  name: 'run',
                  title: this.$tc('Run')
                }
              ]
            }
          }
        ]
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
