<template>
  <TwoCol>
    <ListTable :header-actions="headerActions" :table-config="tableConfig" />
  </TwoCol>
</template>

<script>
import ListTable from '@/components/Table/ListTable'
import { AssetPermissionTableMeta, UserAssetPermissionListPageSearchConfigOptions } from '@/views/perms/const'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'UserAssetPermission',
  components: {
    TwoCol,
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
        hasTree: true,
        columnsExclude: ['actions'],
        columnsExtra: ['action'],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'users_amount', 'user_groups_amount', 'assets_amount',
            'nodes_amount', 'accounts', 'actions'
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

<style scoped>

</style>
