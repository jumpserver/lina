<template>
  <TwoCol>
    <template>
      <DrawerListTable
        ref="listTable"
        :header-actions="headerActions"
        :table-config="tableConfig"
      />
    </template>
    <template #right>
      <AssetRelationCard type="primary" v-bind="assetRelationConfig" />
      <RelationCard style="margin-top: 15px" type="info" v-bind="nodeRelationConfig" />
    </template>
  </TwoCol>
</template>

<script>
import DrawerListTable from '@/components/Table/DrawerListTable/index.vue'
import RelationCard from '@/components/Cards/RelationCard/index.vue'
import AssetRelationCard from '@/components/Apps/AssetRelationCard/index.vue'
import { DeleteActionFormatter, DetailFormatter } from '@/components/Table/TableFormatters'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'AccountChangeSecretAsset',
  components: {
    TwoCol, DrawerListTable, RelationCard, AssetRelationCard
  },
  props: {
    object: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/accounts/change-secret/${this.object.id}/assets/`,
        columns: [
          'name', 'address', 'delete_action'
        ],
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: true,
              route: 'AssetDetail',
              can: this.$hasPerm('assets.view_asset')
            }
          },
          delete_action: {
            prop: 'id',
            label: this.$t('Actions'),
            align: 'center',
            objects: this.object.assets,
            formatter: DeleteActionFormatter,
            onDelete: function(col, row, cellValue, reload) {
              this.$axios.patch(
                `/api/v1/accounts/change-secret/${this.object.id}/asset/remove/`,
                { assets: [row.id] }
              ).then(res => {
                this.$message.success(this.$tc('DeleteSuccessMsg'))
                this.$store.commit('common/reload')
              }).catch(error => {
                this.$message.error(this.$tc('DeleteErrorMsg') + ' ' + error)
              })
            }.bind(this)
          },
          actions: {
            has: false
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
        searchConfig: {
          getUrlQuery: false
        },
        hasMoreActions: false
      },
      assetRelationConfig: {
        icon: 'fa-edit',
        title: this.$t('AddAsset'),
        disabled: this.$store.getters.currentOrgIsRoot,
        canSelect: (row, index) => {
          return (this.object.assets?.map(i => i.id) || []).indexOf(row.id) === -1
        },
        performAdd: (items, that) => {
          const relationUrl = `/api/v1/accounts/change-secret/${this.object.id}/asset/add/`
          const data = {
            assets: items
          }
          return this.$axios.patch(relationUrl, data)
        },
        onAddSuccess: (items, that) => {
          this.$log.debug('AssetSelect value', that.assets)
          this.$message.success(this.$tc('UpdateSuccessMsg'))
          this.$store.commit('common/reload')
        }
      },
      nodeRelationConfig: {
        icon: 'fa-edit',
        title: this.$t('AddNode'),
        objectsAjax: {
          url: `/api/v1/assets/nodes/`,
          transformOption: (item) => {
            return { label: item.full_value, value: item.id }
          }
        },
        disabled: this.$store.getters.currentOrgIsRoot,
        hasObjectsId: this.object.nodes,
        performAdd: (items, that) => {
          const relationUrl = `/api/v1/accounts/change-secret/${this.object.id}/nodes/?action=add`
          const nodes = items.map(v => v.value)
          const iHasObjects = that.iHasObjects.map(v => v.value)
          const data = {
            nodes: Array.from(new Set([...iHasObjects, ...nodes]))
          }
          return this.$axios.patch(relationUrl, data)
        },
        onAddSuccess: (objects, that) => {
          that.iHasObjects = [...that.iHasObjects, ...objects]
          that.$refs.select2.clearSelected()
          this.$message.success(this.$tc('UpdateSuccessMsg'))
          window.location.reload()
        },
        performDelete: (item) => {
          const data = {
            nodes: [item.value]
          }
          const relationUrl = `/api/v1/accounts/change-secret/${this.object.id}/nodes/?action=remove`
          return this.$axios.patch(relationUrl, data)
        },
        onDeleteSuccess: (obj, that) => {
          const theRemoveIndex = that.iHasObjects.findIndex((v) => v.value === obj.value)
          that.iHasObjects.splice(theRemoveIndex, 1)
          while (that.select2.disabledValues.indexOf(obj.value) !== -1) {
            const i = that.select2.disabledValues.indexOf(obj.value)
            that.select2.disabledValues.splice(i, 1)
          }
          this.$message.success(this.$tc('DeleteSuccessMsg'))
          window.location.reload()
          this.$refs.listTable.reloadTable()
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
