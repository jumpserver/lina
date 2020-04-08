<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { LengthFormatter } from '@/components/ListTable/formatters/index'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/perms/asset-permissions/',
        columns: ['name', 'users', 'user_groups', 'assets', 'nodes', 'system_users', 'is_active', 'actions'],
        columnsMeta: {
          users: {
            formatter: LengthFormatter
          },
          user_groups: {
            formatter: LengthFormatter
          },
          assets: {
            formatter: LengthFormatter
          },
          nodes: {
            formatter: LengthFormatter
          },
          system_users: {
            formatter: LengthFormatter
          }
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
