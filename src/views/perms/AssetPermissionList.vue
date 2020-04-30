<template>
  <GenericTreeListPage :table-config="tableConfig" :header-actions="headerActions" :tree-setting="treeSetting" />
</template>

<script>
import GenericTreeListPage from '@/layout/components/GenericTreeListPage'
import { LengthFormatter, ExpandAssetPermissionFormatter } from '@/components/ListTable/formatters/index'

export default {
  components: {
    GenericTreeListPage
  },
  data() {
    return {
      treeSetting: {
        showMenu: false,
        showRefresh: true,
        showAssets: true,
        url: '/api/v1/perms/asset-permissions/',
        nodeUrl: '/api/v1/perms/asset-permissions/',
        treeUrl: '/api/v1/assets/nodes/children/tree/?assets=1'
      },
      tableConfig: {
        url: '/api/v1/perms/asset-permissions/',
        hasSelection: false,
        hasTree: true,
        tagSearch: [
          { label: this.$tc('Name'), key: 'name' },
          { label: this.$t('perms.IsValid'), key: 'is_valid' },
          { label: this.$tc('username'), key: 'username' },
          { label: this.$t('perms.UserGroups'), key: 'user_group' },
          { label: this.$t('perms.IP'), key: 'ip' },
          { label: this.$t('perms.Hostname'), key: 'hostname' },
          { label: this.$t('perms.Node'), key: 'node' },
          { label: this.$t('perms.SystemUser'), key: 'system_user' },
          { label: '继承(先占位)', key: 'all=0' }
        ],
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
        hasExport: false,
        hasImport: false,
        hasRefresh: false,
        hasBulkDelete: false,
        hasBulkUpdate: false,
        extraMoreActions: [
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
