<template>
  <AssetPermissionTree :tree-setting="treeSetting" :table-config="tableConfig">
    <AssetPermissionList :table-config="tableConfig" :header-actions="headerActions" />
  </AssetPermissionTree>
</template>

<script>
import AssetPermissionTree from './AssetPermissionTree'
import AssetPermissionList from './AssetPermissionList'
import { ExpandAssetPermissionFormatter } from '@/components/ListTable/formatters/index'

export default {
  components: {
    AssetPermissionTree,
    AssetPermissionList
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
          { label: this.$tco('Name'), key: 'name' },
          { label: this.$t('perms.IsValid'), key: 'is_valid' },
          { label: this.$tco('username'), key: 'username' },
          { label: this.$t('perms.UserGroups'), key: 'user_group' },
          { label: this.$t('perms.IP'), key: 'ip' },
          { label: this.$t('perms.Hostname'), key: 'hostname' },
          { label: this.$t('perms.Node'), key: 'node' },
          { label: this.$t('perms.SystemUser'), key: 'system_user' },
          { label: '继承(先占位)', key: 'all=0' }
        ],
        columns: ['expand', 'name', 'users_amount', 'user_groups_amount', 'assets_amount', 'nodes_amount', 'system_users_amount', 'is_active', 'actions'],
        columnsMeta: {
          expand: {
            type: 'expand',
            formatter: ExpandAssetPermissionFormatter
          },
          users_amount: {
            label: this.$t('perms.User')
          },
          user_groups_amount: {
            label: this.$t('perms.UserGroups')
          },
          assets_amount: {
            label: this.$t('perms.Asset')
          },
          nodes_amount: {
            label: this.$t('perms.Node')
          },
          system_users_amount: {
            label: this.$t('perms.SystemUser')
          }
        },
        actions: {
          updateRoute: 'AssetPermissionUpdate',
          detailRoute: 'AssetPermissionDetail'
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

<style scoped>

</style>
