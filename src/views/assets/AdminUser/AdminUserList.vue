<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" :help-message="helpMessage" />
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
            label: this.$t('common.Name'),
            formatter: DetailFormatter,
            sortable: true,
            route: 'AdminUserDetail'
          },
          {
            prop: 'username',
            label: this.$t('common.Username'),
            sortable: 'custom'
          },
          {
            prop: 'assets_amount',
            label: this.$t('assets.Assets')
          },
          {
            prop: 'comment',
            label: this.$t('common.Comment'),
            sortable: 'custom'
          },
          {
            prop: 'id',
            align: 'center',
            label: this.$t('common.Action'),
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
      },
      helpMessage: this.$t('assets.AdminUserListHelpMessage')
    }
  }
}
</script>

<style>

</style>
