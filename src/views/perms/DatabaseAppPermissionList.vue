<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import DetailFormatter from '@/components/DataTable/formatters/DetailFormatter'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      showTree: true,
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
            prop: 'users',
            label: this.$t('perms.user')
          },
          {
            prop: 'user_groups',
            label: this.$t('perms.userGroup')
          },
          {
            prop: 'database_apps',
            label: this.$t('perms.DatabaseApp')
          },
          {
            prop: 'system_users',
            label: this.$t('perms.systemUser')
          },
          {
            prop: 'is_valid',
            label: this.$t('perms.validity')
          }
        ],
        tableActions: {
          hasEdit: true,
          editRoute: '404'
        }
      },
      headerActions: {
        hasDelete: false,
        hasUpdate: false,
        createRoute: 'DatabaseAppPermissionCreate'
      }
    }
  }
}
</script>

<style>

</style>
