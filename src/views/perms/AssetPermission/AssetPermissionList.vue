<template>
  <GenericTreeListPage :table-config="tableConfig" :header-actions="headerActions" :tree-setting="treeSetting" />
</template>

<script>
import GenericTreeListPage from '@/layout/components/GenericTreeListPage'
import { ExpandAssetPermissionFormatter } from '@/components/ListTable/formatters/index'

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
          { label: this.$t('common.Name'), key: 'name' },
          { label: this.$t('perms.isValid'), key: 'is_valid' },
          { label: this.$t('common.Username'), key: 'username' },
          { label: this.$t('perms.UserGroups'), key: 'user_group' },
          { label: this.$t('perms.IP'), key: 'ip' },
          { label: this.$t('perms.hostName'), key: 'hostname' },
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
            title: this.$t('perms.refreshPermissionCache'),
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
        this.$message.success(this.$t('perms.refreshSuccess'))
      }).catch(err => {
        this.$message.error(this.$t('perms.refreshFail') + ':' + err)
      })
    }
  }
}
</script>

<style>

</style>
