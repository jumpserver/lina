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
        url: '/api/v1/assets/admin-users/',
        columns: [
          {
            prop: 'name',
            label: this.$t('common.table.Name'),
            formatter: DetailFormatter,
            sortable: true,
            route: 'AdminUserDetail'
          },
          {
            prop: 'username',
            label: this.$t('common.username'),
            sortable: 'custom'
          },
          {
            prop: 'assets_amount',
            label: this.$t('assets.assets')
          },
          {
            prop: 'comment',
            label: this.$t('common.table.Comment'),
            sortable: 'custom'
          },
          {
            prop: 'id',
            align: 'center',
            formatter: ActionsFormatter,
            width: '200px',
            actions: {
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/assets/admin-users/${id}/`
                return this.$axios.delete(url)
              }
            }
          }
        ]
      },
      updateRoute: 'AdminUserUpdate',
      headerActions: {
        hasBulkDelete: false,
        createRoute: 'AdminUserCreate'
      }
    }
  }
}
</script>

<style>

</style>
