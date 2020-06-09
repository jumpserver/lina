<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import ListTable from '@/components/ListTable'
import { DetailFormatter } from '@/components/ListTable/formatters'
export default {
  name: 'UserAssetPermission',
  components: {
    ListTable
  },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/perms/asset-permissions/?user_id=${this.object.id}`,
        hasSelection: false,
        hasTree: true,
        tagSearch: [
          { label: this.$t('common.Name'), key: 'name' },
          { label: this.$t('common.isValid'), key: 'is_valid' },
          { label: this.$t('users.Username'), key: 'username' },
          { label: this.$t('users.UserGroups'), key: 'user_group' },
          { label: this.$t('assets.IP'), key: 'ip' },
          { label: this.$t('assets.Hostname'), key: 'hostname' },
          { label: this.$t('assets.Node'), key: 'node' },
          { label: this.$t('assets.SystemUser'), key: 'system_user' },
          { label: '继承(先占位)', key: 'all=0' }
        ],
        columns: [
          'name', 'users_amount', 'user_groups_amount', 'assets_amount',
          'nodes_amount', 'system_users_amount', 'is_active', 'actions'
        ],
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AssetPermissionDetail'
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
            label: this.$t('perms.UserGroups')
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
            label: this.$t('perms.Node')
          },
          system_users_amount: {
            label: this.$t('perms.SystemUser')
          },
          actions: {
            formatterArgs: {
              updateRoute: 'AssetPermissionUpdate'
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasExport: false,
        hasImport: false,
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
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
