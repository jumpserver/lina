<template>
  <GenericListPage
    ref="listPage"
    :create-drawer="createDrawer"
    :detail-drawer="detailDrawer"
    :header-actions="headerActions"
    :table-config="tableConfig"
  />
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
      createDrawer: () => import('./UserGroupCreateUpdate.vue'),
      detailDrawer: () => import('./UserGroupDetail/index.vue'),
      tableConfig: {
        url: '/api/v1/users/groups/',
        columns: ['name', 'users_amount', 'comment', 'actions', 'labels'],
        columnsShow: {
          default: ['name', 'users_amount', 'comment', 'actions'],
          min: ['name', 'action']
        },
        columnsMeta: {
          users_amount: {
            formatter: AmountFormatter,
            width: 100,
            formatterArgs: {
              async: true,
              getItem(item) {
                return item.is_service_account ? null : item.name
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
