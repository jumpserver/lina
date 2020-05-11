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
        url: '/api/v1/assets/system-users/',
        columns: [
          {
            prop: 'name',
            label: this.$tt('common.name'),
            formatter: DetailFormatter,
            sortable: true,
            route: 'SystemUserDetail'
          },
          {
            prop: 'username',
            label: this.$tt('common.username'),
            sortable: 'custom'
          },
          {
            prop: 'protocol',
            label: this.$tt('assets.protocol'),
            sortable: 'custom'
          },
          {
            prop: 'login_mode_display',
            label: this.$tt('assets.loginMode'),
            sortable: 'custom'
          },
          {
            prop: 'assets_amount',
            label: this.$tt('assets.assets'),
            sortable: 'custom'
          },
          {
            prop: 'comment',
            label: this.$tt('common.comment'),
            sortable: 'custom'
          },
          {
            prop: 'id',
            label: this.$ttc('action'),
            align: 'center',
            formatter: ActionsFormatter,
            width: '200px',
            updateRoute: 'SystemUserUpdate',
            actions: {
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/assets/system-users/${id}/`
                return this.$axios.delete(url)
              }
            }
          }
        ]
      },
      headerActions: {
        // hasBulkDelete: false,
        createRoute: 'SystemUserCreate'
      }
    }
  }
}
</script>

<style>

</style>
