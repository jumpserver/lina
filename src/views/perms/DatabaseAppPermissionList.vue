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
        url: '/api/v1/perms/database-app-permissions/',
        columns: ['name', 'users', 'user_groups', 'database_apps', 'system_users', 'is_valid', 'actions'],
        columnsMeta: {
          users: {
            formatter: LengthFormatter,
            label: this.$t('perms.User')
          },
          user_groups: {
            formatter: LengthFormatter,
            label: this.$t('perms.UserGroups')
          },
          database_apps: {
            formatter: LengthFormatter,
            label: this.$t('perms.DatabaseApp')
          },
          system_users: {
            formatter: LengthFormatter,
            label: this.$t('perms.SystemUser')
          }
        }
      },
      headerActions: {
        hasBulkDelete: false
      }
    }
  }
}
</script>

<style>

</style>
