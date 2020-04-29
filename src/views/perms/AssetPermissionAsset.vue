<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <ListTable :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
    <el-col :md="10" :sm="24">
      <RelationCard v-bind="assetReletionConfig" />
      <RelationCard v-bind="nodeReletionConfig" />
      <RelationCard v-bind="systemUserReletionConfig" />
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
        objectsAjax: {
          url: '/api/v1/assets/assets/'
        }
      },
      nodeReletionConfig: {
        icon: 'fa-info',
        title: this.$t('perms.Add node to this permission'),
        objectsAjax: {
          url: '/api/v1/assets/nodes/',
          processResults(data) {
            let results = data.results
            results = results.map((item) => {
              return { label: item.full_value, value: item.id }
            })
            const more = !!data.next
            return { results: results, pagination: more, total: data.count }
          }
        }
      },
      systemUserReletionConfig: {
        icon: 'fa-info',
        title: this.$t('perms.Add System User to this permission'),
        objectsAjax: {
          url: '/api/v1/assets/system-users/',
          processResults(data) {
            let results = data.results
            results = results.map((item) => {
              return { label: item.name + '(' + item.username + ')', value: item.id }
            })
            const more = !!data.next
            return { results: results, pagination: more, total: data.count }
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
