<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import ListTable from '@/components/ListTable'
import { ExpandAssetPermissionFormatter } from '@/components/ListTable/formatters'
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
          'expand', 'name', 'users_amount', 'user_groups_amount', 'assets_amount',
          'nodes_amount', 'system_users_amount', 'is_active', 'actions'
        ],
        columnsMeta: {
          expand: {
            type: 'expand',
            formatter: ExpandAssetPermissionFormatter
          },
          users_amount: {
            label: this.$t('users.Users')
          },
          user_groups_amount: {
            label: this.$t('users.UserGroups')
          },
          assets_amount: {
            label: this.$t('assets.Assets')
          },
          nodes_amount: {
            label: this.$t('assets.Nodes')
          },
          system_users_amount: {
            label: this.$t('assets.SystemUsers')
          },
          actions: {
            formatterArgs: {
              updateRoute: 'AssetPermissionUpdate',
              detailRoute: 'AssetPermissionDetail'
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasExport: false,
        hasImport: false
      }
    }
  }
}
</script>

<style scoped>

</style>
