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
        hasSelection: false,
        columns: ['expand', 'name', 'users', 'user_groups', 'assets', 'nodes', 'system_users', 'is_active', 'actions'],
        columnsMeta: {
          expand: {
            type: 'expand'
          },
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
        hasBulkDelete: false,
        createRoute: 'AssetPermissionCreate',
        extraActions: [
          {
            name: 'RefreshPermissionCache',
            title: this.$t('perms.RefreshPermissionCache'),
            type: 'primary',
            has: true,
            callback: this.HandleRefreshPermissionCache
          }
        ]
      }
    }
  },
  methods: {
    HandleRefreshPermissionCache() {
      const url = '/api/v1/perms/asset-permissions/cache/refresh/'
      this.$axios.get(url).then(res => {
        this.$message.success(this.$t('perms.ReFreshSuccess'))
      }).catch(err => {
        this.$message.error(this.$t('perms.ReFreshFail') + ':' + err)
      })
    }
  }
}
</script>

<style>

</style>
