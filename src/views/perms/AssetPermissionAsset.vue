<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <ListTable :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
    <el-col :md="10" :sm="24">
      <RelationCard v-if="!assetReletionConfig.loading" v-bind="assetReletionConfig" />
      <RelationCard v-if="!nodeReletionConfig.loading" v-bind="nodeReletionConfig" />
      <RelationCard v-if="!systemUserReletionConfig.loading" v-bind="systemUserReletionConfig" />
    </el-col>
  </el-row>
</template>

<script>
import ListTable from '@/components/ListTable'
import { RelationCard } from '@/components'
import { DeleteActionFormatter } from '@/components/ListTable/formatters/index'

export default {
  name: 'AssetPermissionAsset',
  components: {
    ListTable,
    RelationCard
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/perms/asset-permissions/${this.$route.params.id}/assets/all/`,
        columns: [
          'asset_display', 'delete_action'
        ],
        columnsMeta: {
          asset_display: {
            label: this.$t('perms.Asset'),
            align: 'center'
          },
          delete_action: {
            prop: 'asset',
            label: this.$tc('Action'),
            align: 'center',
            width: 150,
            formatter: DeleteActionFormatter,
            deleteUrl: `/api/v1/perms/asset-permissions-assets-relations/?assetpermission=${this.$route.params.id}&asset=`
          }
        },
        tableAttrs: {
          border: false
        }
      },
      headerActions: {
        hasExport: false,
        hasImport: false,
        hasRefresh: false,
        hasCreate: false,
        hasBulkDelete: false,
        hasBulkUpdate: false,
        hasLeftActions: false,
        hasSearch: false,
        hasRightActions: false
      },
      assetPermissionAsset: [],
      assetPermissionNode: [],
      assetPermissionSystemUser: [],
      assetReletionConfig: {
        icon: 'fa-info',
        title: this.$t('perms.Add asset to this permission'),
        url: '/api/v1/assets/assets/',
        value: [],
        loading: false
      },
      nodeReletionConfig: {
        icon: 'fa-info',
        title: this.$t('perms.Add node to this permission'),
        url: '/api/v1/assets/nodes/',
        value: [],
        loading: false
      },
      systemUserReletionConfig: {
        icon: 'fa-info',
        title: this.$t('perms.Add System User to this permission'),
        url: '/api/v1/assets/system-users/',
        value: [],
        loading: false
      }
    }
  }
}
</script>

<style scoped>

</style>
