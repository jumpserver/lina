<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <ListTable ref="listTable" :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
    <el-col :md="10" :sm="24">
      <AssetRelationCard type="primary" v-bind="assetRelationConfig" />
      <RelationCard type="info" style="margin-top: 15px" v-bind="nodeRelationConfig" />
      <RelationCard type="warning" style="margin-top: 15px" v-bind="systemUserRelationConfig" />
    </el-col>
  </el-row>
</template>

<script>
import ListTable from '@/components/ListTable'
import RelationCard from '@/components/RelationCard'
import { DeleteActionFormatter } from '@/components/ListTable/formatters/index'
import AssetRelationCard from './AssetRelationCard/index'

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
            label: this.$t('common.Actions'),
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
        hasSearch: false,
        hasLeftActions: false,
        hasRightActions: false
      },
      assetRelationConfig: {
        icon: 'fa-edit',
        title: this.$t('perms.addAssetToThisPermission'),
        performAdd: (items) => {
          const relationUrl = `/api/v1/perms/asset-permissions-assets-relations/`
          const objectId = this.object.id
          const data = items.map(v => {
            return {
              assetpermission: objectId,
              asset: v
            }
          })
          return this.$axios.post(relationUrl, data)
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
          return this.$axios.post(relationUrl, data)
        },
        onAddSuccess: (objects, that) => {
          this.$log.debug('Select value', that.select2.value)
          that.iHasObjects = [...that.iHasObjects, ...objects]
          that.$refs.select2.clearSelected()
          this.$message.success(this.$t('common.updateSuccessMsg'))
          setTimeout(() => location.reload(), 300)
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
          this.$message.success(this.$t('common.deleteSuccessMsg'))
          setTimeout(() => location.reload(), 300)
        }
      },
      systemUserRelationConfig: {
        icon: 'fa-edit',
        title: this.$t('perms.addSystemUserToThisPermission'),
        objectsAjax: {
          url: '/api/v1/assets/system-users/',
          transformOption: (item) => {
            return { label: item.name + '(' + item.username + ')', value: item.id }
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
        onAddSuccess: (objects, that) => {
          this.$log.debug('Select value', that.select2.value)
          that.iHasObjects = [...that.iHasObjects, ...objects]
          that.$refs.select2.clearSelected()
          this.$message.success(this.$t('common.updateSuccessMsg'))
          setTimeout(() => location.reload(), 300)
        },
        performDelete: (item) => {
          const itemId = item.value
          const objectId = this.object.id
          const relationUrl = `/api/v1/perms/asset-permissions-system-users-relations/?assetpermission=${objectId}&systemuser=${itemId}`
          return this.$axios.delete(relationUrl)
        },
        onDeleteSuccess: (obj, that) => {
          // 从hasObjects中移除这个object
          const theRemoveIndex = that.iHasObjects.findIndex((v) => v.value === obj.value)
          that.iHasObjects.splice(theRemoveIndex, 1)
          // 从disabled values中移除这个value
          while (that.select2.disabledValues.indexOf(obj.value) !== -1) {
            const i = that.select2.disabledValues.indexOf(obj.value)
            this.$log.debug('disabled values remove index: ', i)
            that.select2.disabledValues.splice(i, 1)
          }
          this.$message.success(this.$t('common.deleteSuccessMsg'))
          setTimeout(() => location.reload(), 300)
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
