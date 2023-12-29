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
        columnsShow: {
          default: ['name', 'users', 'comment', 'actions'],
          min: ['name', 'action']
        },
        columnsMeta: {
          users_amount: {
            label: this.$t('users.Users'),
            width: '120px'
          },
          users: {
            label: this.$t('perms.User'),
            width: '160px',
            formatter: AmountFormatter,
            formatterArgs: {
              getItem(item) {
                return item.is_service_account ? null : item.name
              },
              routeQuery: {
                activeTab: 'GroupUser'
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
