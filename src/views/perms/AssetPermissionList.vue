<template>
  <!--  <TreeTable :table-config="tableConfig" :header-actions="headerActions" />-->
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />

</template>

<script>
// import TreeTable from '@/components/TreeTable'
import { GenericListPage } from '@/layout/components'
import { LengthFormatter, ExpandAssetPermissionFormatter } from '@/components/ListTable/formatters/index'

export default {
  components: {
    // TreeTable
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/perms/asset-permissions/',
        treeurl: '/api/v1/assets/nodes/children/tree/',
        hasSelection: false,
        columns: ['expand', 'name', 'users', 'user_groups', 'assets', 'nodes', 'system_users', 'is_active', 'actions'],
        columnsMeta: {
          expand: {
            type: 'expand',
            formatter: ExpandAssetPermissionFormatter
          },
          users: {
            formatter: LengthFormatter,
            label: this.$t('perms.User')
          },
          user_groups: {
            formatter: LengthFormatter,
            label: this.$t('perms.UserGroups')
          },
          assets: {
            formatter: LengthFormatter,
            label: this.$t('perms.Asset')
          },
          nodes: {
            formatter: LengthFormatter,
            label: this.$t('perms.Node')
          },
          system_users: {
            formatter: LengthFormatter,
            label: this.$t('perms.SystemUser')
          }
        },
        actions: {
          updateRoute: 'AssetPermissionUpdate'
        }
      },
      headerActions: {
        hasBulkDelete: false,
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
