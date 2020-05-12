<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { ListTable } from '@/components'
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
          { label: this.$t('common.name'), key: 'name' },
          { label: this.$t('common.isValid'), key: 'is_valid' },
          { label: this.$t('users.username'), key: 'username' },
          { label: this.$t('users.userGroups'), key: 'user_group' },
          { label: this.$t('assets.IP'), key: 'ip' },
          { label: this.$t('assets.hostname'), key: 'hostname' },
          { label: this.$t('assets.node'), key: 'node' },
          { label: this.$t('assets.systemUser'), key: 'system_user' },
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
            label: this.$t('users.users')
          },
          user_groups_amount: {
            label: this.$t('users.userGroups')
          },
          assets_amount: {
            label: this.$t('users.assets')
          },
          nodes_amount: {
            label: this.$t('assets.nodes')
          },
          system_users_amount: {
            label: this.$t('assets.systemUsers')
          },
          actions: {
            updateRoute: 'AssetPermissionUpdate',
            detailRoute: 'AssetPermissionDetail'
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasExport: false
      }
    }
  }
}
</script>

<style scoped>

</style>
