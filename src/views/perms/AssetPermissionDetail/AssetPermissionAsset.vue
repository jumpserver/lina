<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <ListTable ref="listTable" v-loading="loading" :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
    <el-col :md="10" :sm="24">
      <AssetRelationCard type="primary" v-bind="assetReletionConfig" />
      <RelationCard type="info" style="margin-top: 15px" v-bind="nodeReletionConfig" />
      <RelationCard type="warning" style="margin-top: 15px" v-bind="systemUserReletionConfig" />
    </el-col>
  </el-row>
</template>

<script>
import ListTable from '@/components/ListTable'
import { RelationCard } from '@/components'
import { DeleteActionFormatter } from '@/components/ListTable/formatters/index'
import AssetRelationCard from '../AssetRelationCard'

export default {
  name: 'AssetPermissionAsset',
  components: {
    ListTable,
    RelationCard,
    AssetRelationCard
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: false,
      tableConfig: {
        url: `/api/v1/perms/asset-permissions/${this.object.id}/assets/all/`,
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
            label: this.$ttc('action'),
            align: 'center',
            width: 150,
            objects: this.object.assets,
            formatter: DeleteActionFormatter,
            deleteUrl: `/api/v1/perms/asset-permissions-assets-relations/?assetpermission=${this.object.id}&asset=`
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
      assetReletionConfig: {
        icon: 'fa-edit',
        title: this.$t('perms.Add asset to this permission'),
        performAdd: (items) => {
          const relationUrl = `/api/v1/perms/asset-permissions-assets-relations/`
          const objectId = this.object.id
          const data = items.map(v => {
            return {
              assetpermission: objectId,
              asset: v
            }
          })
          this.loading = true
          const that = this
          const res = this.$axios.post(relationUrl, data)
          setTimeout(function() {
            that.$refs.listTable.$refs.dataTable.$refs.dataTable.$refs.table.getList()
            that.loading = false
          }, 500)
          return res
        }
      },
      nodeReletionConfig: {
        icon: 'fa-edit',
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
        },
        hasObjectsId: this.object.nodes,
        performAdd: (items) => {
          const relationUrl = `/api/v1/perms/asset-permissions-nodes-relations/`
          const objectId = this.object.id
          const data = items.map(v => {
            return {
              assetpermission: objectId,
              node: v.value
            }
          })
          this.loading = true
          const that = this
          const res = this.$axios.post(relationUrl, data)
          setTimeout(function() {
            that.$refs.listTable.$refs.dataTable.$refs.dataTable.$refs.table.getList()
            that.loading = false
          }, 500)
          return res
        },
        performDelete: (item) => {
          const itemId = item.value
          const objectId = this.object.id
          const relationUrl = `/api/v1/perms/asset-permissions-nodes-relations/?assetpermission=${objectId}&node=${itemId}`
          this.loading = true
          const that = this
          const res = this.$axios.delete(relationUrl)
          setTimeout(function() {
            that.$refs.listTable.$refs.dataTable.$refs.dataTable.$refs.table.getList()
            that.loading = false
          }, 500)
          return res
        }
      },
      systemUserReletionConfig: {
        icon: 'fa-edit',
        title: this.$t('perms.Add System User to this permission'),
        objectsAjax: {
          url: '/api/v1/assets/system-users/',
          processResults(data) {
            let results = data.results
            results = results.filter((item) => item.protocol !== 'mysql').map((item) => {
              return { label: item.name + '(' + item.username + ')', value: item.id }
            })
            const more = !!data.next
            return { results: results, pagination: more, total: data.count }
          }
        },
        hasObjectsId: this.object.system_users,
        performAdd: (items) => {
          const relationUrl = `/api/v1/perms/asset-permissions-system-users-relations/`
          const objectId = this.object.id
          const data = items.map(v => {
            return {
              assetpermission: objectId,
              systemuser: v.value
            }
          })
          return this.$axios.post(relationUrl, data)
        },
        performDelete: (item) => {
          const itemId = item.value
          const objectId = this.object.id
          const relationUrl = `/api/v1/perms/asset-permissions-system-users-relations/?assetpermission=${objectId}&systemuser=${itemId}`
          return this.$axios.delete(relationUrl)
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
