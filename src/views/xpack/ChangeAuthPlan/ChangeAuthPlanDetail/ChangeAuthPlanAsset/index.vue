<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <ListTable ref="listTable" :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
    <el-col :md="10" :sm="24">
      <AssetRelationCard type="primary" v-bind="assetRelationConfig" />
      <RelationCard type="info" style="margin-top: 15px" v-bind="nodeRelationConfig" />
    </el-col>
  </el-row>
</template>

<script>
import ListTable from '@/components/ListTable/index'
import RelationCard from '@/components/RelationCard/index'
import AssetRelationCard from './AssetRelationCard'

export default {
  name: 'ChangeAuthPlanAsset',
  components: {
    ListTable, RelationCard, AssetRelationCard
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
        url: `/api/v1/xpack/change-auth-plan/plan/${this.object.id}/assets/`,
        columns: [
          'hostname', 'ip'
        ],
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
      assetRelationConfig: {
        icon: 'fa-edit',
        title: this.$t('xpack.ChangeAuthPlan.addAsset'),
        performAdd: (items, vm) => {
          const relationUrl = `/api/v1/xpack/change-auth-plan/plan/${this.object.id}/asset/add/`
          const data = {
            assets: items
          }
          return this.$axios.patch(relationUrl, data)
        }
      },
      nodeRelationConfig: {
        icon: 'fa-edit',
        title: this.$t('xpack.ChangeAuthPlan.addNode'),
        objectsAjax: {
          url: `/api/v1/assets/nodes/`,
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
          const relationUrl = `/api/v1/xpack/change-auth-plan/plan/${this.object.id}/`
          const nodes = items.map(v => v.value)
          const data = {
            nodes: Array.from(new Set([...this.object.nodes, ...nodes]))
          }
          return this.$axios.patch(relationUrl, data)
        },
        onAddSuccess: (objects, that) => {
          this.$log.debug('Select value', that.select2.value)
          that.iHasObjects = [...that.iHasObjects, ...objects]
          that.$refs.select2.clearSelected()
          this.$message.success(this.$t('common.updateSuccessMsg'))
          setTimeout(() => location.reload(), 500)
        },
        performDelete: (item) => {
          const nodes = this.object.nodes
          const deleteNode = item.value
          nodes.splice(nodes.indexOf(deleteNode), 1)
          const data = {
            nodes: nodes
          }
          const relationUrl = `/api/v1/xpack/change-auth-plan/plan/${this.object.id}/`
          return this.$axios.patch(relationUrl, data)
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
          setTimeout(() => location.reload(), 500)
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
