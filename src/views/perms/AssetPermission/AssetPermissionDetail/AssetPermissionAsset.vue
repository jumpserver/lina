<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <ListTable ref="ListTable" :header-actions="headerActions" :table-config="tableConfig" class- />
    </el-col>
    <el-col :md="10" :sm="24">
      <AssetRelationCard type="primary" v-bind="assetRelationConfig" />
      <RelationCard style="margin-top: 15px" type="info" v-bind="nodeRelationConfig" />
    </el-col>
  </el-row>
</template>

<script>
import ListTable from '@/components/Table/ListTable'
import RelationCard from '@/components/Cards/RelationCard'
import { DeleteActionFormatter } from '@/components/Table/TableFormatters'
import AssetRelationCard from '@/components/Apps/AssetRelationCard'

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
    const id = this.object.id
    const url = id ? `/api/v1/perms/asset-permissions/${id}/assets/all/` : ''
    return {
      tableConfig: {
        url: url,
        id: 'asset',
        columnsExclude: ['asset'],
        columnsExtra: ['delete_action'],
        columns: [
          'asset_display', 'delete_action'
        ],
        columnsShow: {
          min: ['asset_display', 'delete_action']
        },
        columnsMeta: {
          asset_display: {
            label: this.$t('perms.Asset'),
            align: 'center'
          },
          actions: {
            has: false
          },
          delete_action: {
            prop: 'asset',
            label: this.$t('common.Actions'),
            align: 'center',
            width: 150,
            objects: this.object.assets,
            formatter: DeleteActionFormatter,
            onDelete: function(col, row, cellValue, reload) {
              const url = `/api/v1/perms/asset-permissions-assets-relations/?assetpermission=${this.object.id}&asset=${cellValue}`
              this.$axios.delete(url).then(res => {
                this.$message.success(this.$tc('common.deleteSuccessMsg'))
                this.$store.commit('common/reload')
              }).catch(error => {
                this.$message.error(this.$tc('common.deleteErrorMsg') + ' ' + error)
              })
            }.bind(this)
          }
        },
        tableAttrs: {
          border: false
        }
      },
      headerActions: {
        hasSearch: true,
        hasRefresh: true,
        hasLeftActions: true,
        hasRightActions: true,
        hasExport: false,
        hasImport: false,
        hasCreate: false,
        hasMoreActions: false
      },
      assetRelationConfig: {
        icon: 'fa-edit',
        title: this.$t('perms.addAssetToThisPermission'),
        hasObjectsId: this.object.assets?.map(i => i.id) || [],
        disabled: this.$store.getters.currentOrgIsRoot,
        canSelect: (row, index) => {
          return (this.object.assets?.map(i => i.id) || []).indexOf(row.id) === -1
        },
        performAdd: (items, that) => {
          const relationUrl = `/api/v1/perms/asset-permissions-assets-relations/`
          const objectId = this.object.id
          const data = items.map(item => {
            return {
              assetpermission: objectId,
              asset: item
            }
          })
          return this.$axios.post(relationUrl, data)
        },
        onAddSuccess: (items, that) => {
          this.$log.debug('AssetSelect value', that.assets)
          this.$message.success(this.$tc('common.updateSuccessMsg'))
          this.$store.commit('common/reload')
        }
      },
      nodeRelationConfig: {
        icon: 'fa-edit',
        title: this.$t('perms.addNodeToThisPermission'),
        objectsAjax: {
          url: '/api/v1/assets/nodes/',
          transformOption: (item) => {
            return { label: item.full_value, value: item.id }
          }
        },
        hasObjectsId: this.object.nodes?.map(i => i.id) || [],
        performAdd: (items) => {
          const relationUrl = `/api/v1/perms/asset-permissions-nodes-relations/`
          const objectId = this.object.id
          const data = items.map(v => {
            return {
              assetpermission: objectId,
              node: v.value
            }
          })
          return this.$axios.post(relationUrl, data)
        },
        onAddSuccess: (objects, that) => {
          this.$log.debug('Select value', that.select2.value)
          that.iHasObjects = [...that.iHasObjects, ...objects]
          that.$refs.select2.clearSelected()
          this.$message.success(this.$tc('common.updateSuccessMsg'))
          this.$refs.ListTable.reloadTable()
        },
        performDelete: (item) => {
          const itemId = item.value
          const objectId = this.object.id
          const relationUrl = `/api/v1/perms/asset-permissions-nodes-relations/?assetpermission=${objectId}&node=${itemId}`
          return this.$axios.delete(relationUrl)
        },
        onDeleteSuccess: (obj, that) => {
          const theRemoveIndex = that.iHasObjects.findIndex((v) => v.value === obj.value)
          that.iHasObjects.splice(theRemoveIndex, 1)
          while (that.select2.disabledValues.indexOf(obj.value) !== -1) {
            const i = that.select2.disabledValues.indexOf(obj.value)
            this.$log.debug('disabled values remove index: ', i)
            that.select2.disabledValues.splice(i, 1)
          }
          this.$message.success(this.$tc('common.deleteSuccessMsg'))
          this.$refs.ListTable.reloadTable()
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
