<template>
  <GenericListPage ref="listPage" :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import AmountFormatter from '@/components/Table/TableFormatters/AmountFormatter.vue'
import { GenericListDrawerPage as GenericListPage } from '@/layout/components'

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
            formatter: AmountFormatter,
            formatterArgs: {
              async: true,
              getItem(item) {
                return item.is_service_account ? null : item.name
              },
              getRoute({ row }) {
                return {
                  name: 'UserGroupDetail',
                  params: {
                    id: row.id
                  },
                  query: {
                    tab: 'GroupUser'
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
