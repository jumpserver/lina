<template>
  <TwoCol>
    <DrawerListTable
      :create-drawer="createDrawer"
      :detail-drawer="detailDrawer"
      :header-actions="headerActions"
      :table-config="tableConfig"
      :resource="$t('AssetPermissionRules')"
    />
  </TwoCol>
</template>

<script>
import { DrawerListTable } from '@/components'
import { AssetPermissionTableMeta, UserAssetPermissionListPageSearchConfigOptions } from '@/views/perms/const'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'UserAssetPermission',
  components: {
    TwoCol,
    DrawerListTable
  },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      createDrawer: () => import('@/views/perms/AssetPermission/AssetPermissionCreateUpdate'),
      detailDrawer: () => import('@/views/perms/AssetPermission/AssetPermissionDetail/index.vue'),
      tableConfig: {
        url: `/api/v1/perms/asset-permissions/?user_id=${this.object.id}`,
        hasTree: true,
        columnsExtra: ['action'],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'users_amount', 'user_groups_amount',
            'assets_amount', 'nodes_amount', 'accounts', 'actions'
          ]
        },
        columnsMeta: AssetPermissionTableMeta
      },
      headerActions: {
        hasLeftActions: false,
        hasExport: false,
        hasImport: false,
        searchConfig: {
          url: '',
          options: UserAssetPermissionListPageSearchConfigOptions
        }
      }
    }
  }
}
</script>
