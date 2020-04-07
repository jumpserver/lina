<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter, ActionsFormatter, ChoicesFormatter } from '@/components/ListTable/formatters/index'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/perms/database-app-permissions/',
        columns: [
          {
            prop: 'name',
            label: this.$t('perms.name'),
            formatter: DetailFormatter,
            sortable: true,
            route: 'DatabaseAppPermissionDetail'
          },
          {
            prop: 'users.length',
            label: this.$t('perms.user')
          },
          {
            prop: 'user_groups.length',
            label: this.$t('perms.userGroup')
          },
          {
            prop: 'database_apps.length',
            label: this.$t('perms.DatabaseApp')
          },
          {
            prop: 'system_users.length',
            label: this.$t('perms.systemUser')
          },
          {
            prop: 'is_valid',
            label: this.$t('perms.validity'),
            formatter: ChoicesFormatter,
            align: 'center',
            width: '80px'
          },
          {
            prop: 'id',
            label: this.$tc('Action'),
            align: 'center',
            formatter: ActionsFormatter,
            width: '200px',
            actions: {
              performDelete: ({row, col})=> {
                const id = row.id
                const url = `/api/v1/perms/database-app-permissions/${id}/`
                return this.$axios.delete(url)
              }
            }
          }
        ]
      },
      headerActions: {
        hasBulkDelete: false,
        createRoute: 'DatabaseAppPermissionCreate'
      }
    }
  }
}
</script>

<style>

</style>
