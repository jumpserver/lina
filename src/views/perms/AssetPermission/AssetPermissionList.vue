<template>
  <GenericTreeListPage :table-config="tableConfig" :header-actions="headerActions" :tree-setting="treeSetting" />
</template>

<script>
import GenericTreeListPage from '@/layout/components/GenericTreeListPage'
import { DetailFormatter } from '@/components/ListTable/formatters/index'

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
        columns: ['name', 'users_amount', 'user_groups_amount', 'assets_amount', 'nodes_amount', 'system_users_amount', 'is_valid', 'actions'],
        columnsMeta: {
          name: {
            formatterArgs: {
              routeQuery: {
                activeTab: 'AssetPermissionDetail'
              }
            }
          },
          users_amount: {
            label: this.$t('perms.User'),
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'AssetPermissionUser'
              }
            }
          },
          user_groups_amount: {
            label: this.$t('perms.UserGroups'),
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'AssetPermissionUser'
              }
            }
          },
          assets_amount: {
            label: this.$t('perms.Asset'),
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'AssetPermissionAsset'
              }
            }
          },
          nodes_amount: {
            label: this.$t('perms.Node'),
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'AssetPermissionAsset'
              }
            }
          },
          system_users_amount: {
            label: this.$t('perms.SystemUser'),
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'AssetPermissionAsset'
              }
            }
          },
          actions: {
            formatterArgs: {
              updateRoute: 'AssetPermissionUpdate'
            }
          }
        }
      },
      headerActions: {
        createRoute: {
          name: 'AssetPermissionCreate',
          query: this.$route.query
        },
        searchConfig: {
          url: '',
          options: [
            { label: this.$t('common.Name'), value: 'name' },
            { label: this.$t('perms.isValid'), value: 'is_valid' },
            { label: this.$t('common.Username'), value: 'username' },
            { label: this.$t('perms.UserGroups'), value: 'user_group' },
            { label: this.$t('perms.IP'), value: 'ip' },
            { label: this.$t('perms.hostName'), value: 'hostname' },
            { label: this.$t('perms.Node'), value: 'node' },
            { label: this.$t('perms.SystemUser'), value: 'system_user' },
            {
              label: this.$t('perms.Inherit'), value: 'all',
              children: [
                {
                  value: '1',
                  label: this.$t('perms.Include')
                },
                {
                  value: '0',
                  label: this.$t('perms.Exclude')
                }
              ]
            }
          ]
        },
        hasRightActions: false,
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
