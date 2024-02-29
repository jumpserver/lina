<template>
  <GenericListPage :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import AmountFormatter from '@/components/Table/TableFormatters/AmountFormatter.vue'

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
