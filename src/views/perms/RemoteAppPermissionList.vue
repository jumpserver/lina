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
        url: '/api/v1/perms/remote-app-permissions/',
        columns: ['name', 'users', 'user_groups', 'remote_apps', 'system_users', 'is_valid', 'actions'],
        columnsMeta: {
          users: {
            formatter: LengthFormatter
          },
          user_groups: {
            formatter: LengthFormatter
          },
          remote_apps: {
            formatter: LengthFormatter
          },
          system_users: {
            formatter: LengthFormatter
          }
        }
      },
      headerActions: {
        hasBulkDelete: false,
        createRoute: 'RemoteAppPermissionCreate'
      }
    }
  }
}
</script>

<style>

</style>
