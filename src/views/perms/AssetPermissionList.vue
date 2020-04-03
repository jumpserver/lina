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
      tableConfig: {
        url: '/api/v1/perms/asset-permissions/',
        columns: [
          {
            prop: 'name',
            label: this.$t('common.name'),
            formatter: DetailFormatter,
            sortable: true,
            route: 'AssetPermissionDetail'
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
            prop: 'assets',
            label: this.$t('perms.asset')
          },
          {
            prop: 'nodes',
            label: this.$t('perms.node')
          },
          {
            prop: 'system_users',
            label: this.$t('perms.systemUser')
          },
          {
            prop: 'is_active',
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
        createRoute: 'AssetPermissionCreate'
      }
    }
  }
}
</script>

<style>

</style>
