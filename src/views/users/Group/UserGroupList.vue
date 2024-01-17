<template>
  <GenericListPage :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter } from '@/components/Table/TableFormatters'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/users/groups/',
        columns: ['name', 'users_amount', 'comment', 'actions'],
        columnsShow: {
          default: ['name', 'users_amount', 'comment', 'actions'],
          min: ['name', 'action']
        },
        columnsMeta: {
          users_amount: {
            label: this.$t('users.Users'),
            width: '120px',
            formatter: DetailFormatter,
            formatterArgs: {
              getRoute({ row }) {
                return {
                  name: 'UserGroupDetail',
                  params: {
                    id: row.id
                  },
                  query: {
                    activeTab: 'GroupUser'
                  }
                }
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
        hasLabelSearch: true,
        createRoute: 'UserGroupCreate'
      }
    }
  }
}
</script>

<style>

</style>
