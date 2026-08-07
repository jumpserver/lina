<template>
  <TwoCol>
    <DrawerListTable
      v-if="tableConfig"
      :key="tableKey"
      :header-actions="headerActions"
      :table-config="tableConfig"
    />
    <template #right>
      <AssetRelationCard v-bind="assetRelationConfig" type="primary" />
      <RelationCard
        v-if="nodeRelationConfig"
        ref="nodeRelationCard"
        v-bind="nodeRelationConfig"
        style="margin-top: 15px"
        type="info"
      >
        <tr v-for="node of nodeOptions" :key="node.value" class="item">
          <td style="width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
            <el-tooltip
              :content="node.label.toString()"
              :show-after="500"
              effect="dark"
              placement="left"
              style="margin: 4px"
            >
              <b>{{ node.label }}</b>
            </el-tooltip>
          </td>
          <td>
            <el-button
              :disabled="$store.getters.currentOrgIsRoot"
              size="small"
              style="float: right"
              type="danger"
              @click="removeNode(node)"
            >
              <i class="fa fa-minus" />
            </el-button>
          </td>
        </tr>
      </RelationCard>
    </template>
  </TwoCol>
</template>

<script>
import AssetRelationCard from '@/components/Apps/AssetRelationCard/index.vue'
import RelationCard from '@/components/Cards/RelationCard/index.vue'
import DrawerListTable from '@/components/Table/DrawerListTable/index.vue'
import { DeleteActionFormatter, DetailFormatter } from '@/components/Table/TableFormatters'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import { getRelationIds } from './automation'

export default {
  name: 'AutomationAssetNode',
  emits: ['reload-table'],
  components: {
    TwoCol,
    RelationCard,
    DrawerListTable,
    AssetRelationCard
  },
  props: {
    object: {
      type: Object,
      required: true,
      default: () => ({})
    },
    // 关系端点基路径,如 /api/v1/accounts/gather-account
    // 资产/节点的分页与增删全部走后端 RelationView 端点,前端不展开节点。
    relationUrl: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      assetIds: getRelationIds(this.object.assets),
      nodeIds: getRelationIds(this.object.nodes),
      nodeOptions: this.getRelationOptions(this.object.nodes),
      tableConfig: null,
      tableKey: 0,
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
        canSelect: (row) => !this.assetIds.includes(row.id),
        performAdd: (items) => this.addAssets(items),
        onAddSuccess: (items) => {
          this.assetIds = [...new Set([...this.assetIds, ...items])]
          this.$message.success(this.$tc('UpdateSuccessMsg'))
          this.refreshRelations()
        }
      },
      nodeRelationConfig: this.createNodeRelationConfig()
    }
  },
  created() {
    this.tableConfig = this.createTableConfig()
  },
  methods: {
    createNodeRelationConfig() {
      return {
        icon: 'fa-edit',
        title: this.$t('AddNode'),
        disabled: this.$store.getters.currentOrgIsRoot,
        hasObjectsId: this.nodeIds,
        showHasObjects: false,
        objectsAjax: {
          url: '/api/v1/assets/nodes/',
          transformOption: (item) => ({ label: item.full_value, value: item.id })
        },
        performAdd: (items, relationCard) => {
          return this.updateNodes('add', this.getRelationIds(items))
        },
        onAddSuccess: (items, relationCard) => {
          const currentIds = this.getRelationIds(this.nodeOptions)
          this.nodeOptions = [
            ...this.nodeOptions,
            ...items.filter((item) => !currentIds.includes(item.value))
          ]
          relationCard.iHasObjects = this.nodeOptions
          this.nodeIds = [...new Set([...this.nodeIds, ...this.getRelationIds(items)])]
          this.$message.success(this.$tc('UpdateSuccessMsg'))
          this.refreshRelations()
        }
      }
    },
    getRelationIds(items) {
      return getRelationIds(items)
    },
    getRelationOptions(items) {
      return (items || []).map((item) => {
        const value = item.value || item.id || item
        return {
          label: item.full_value || item.name || value,
          value
        }
      })
    },
    removeNode(node) {
      this.updateNodes('remove', [node.value])
        .then(() => {
          this.nodeIds = this.nodeIds.filter((nodeId) => nodeId !== node.value)
          this.nodeOptions = this.nodeOptions.filter((item) => item.value !== node.value)
          this.$refs.nodeRelationCard.iHasObjects = this.nodeOptions
          this.$message.success(this.$tc('DeleteSuccessMsg'))
          this.refreshRelations()
        })
        .catch((error) => {
          this.$message.error(this.$tc('DeleteErrorMsg') + ' ' + error)
        })
    },
    // 表格直接指向后端分页端点,由后端 get_all_assets() 求「直接绑定 ∪ 节点展开」并集并分页,
    // 前端不再展开节点。删除按钮仅挂直接绑定资产(assetIds),节点派生行不可单独删除。
    createTableConfig() {
      return {
        url: `${this.relationUrl}/${this.object.id}/assets/`,
        columns: ['name', 'address', 'delete_action'],
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
            objects: this.assetIds.map((id) => ({ id })),
            formatter: DeleteActionFormatter,
            onDelete: this.removeAsset.bind(this)
          },
          actions: {
            has: false
          }
        },
        tableAttrs: {
          border: false
        }
      }
    },
    removeAsset(col, row) {
      this.removeAssets([row.id])
        .then(() => {
          this.assetIds = this.assetIds.filter((assetId) => assetId !== row.id)
          this.$message.success(this.$tc('DeleteSuccessMsg'))
          this.refreshRelations()
        })
        .catch((error) => {
          this.$message.error(this.$tc('DeleteErrorMsg') + ' ' + error)
        })
    },
    addAssets(assetIds) {
      return this.$axios.patch(`${this.relationUrl}/${this.object.id}/asset/add/`, {
        assets: [...new Set(assetIds)]
      })
    },
    removeAssets(assetIds) {
      return this.$axios.patch(`${this.relationUrl}/${this.object.id}/asset/remove/`, {
        assets: assetIds
      })
    },
    updateNodes(action, nodeIds) {
      return this.$axios.patch(`${this.relationUrl}/${this.object.id}/nodes/?action=${action}`, {
        nodes: nodeIds
      })
    },
    refreshRelations() {
      // 重建 tableConfig 让 delete 按钮的 objects(直接绑定资产)同步,并重新拉取分页数据
      this.tableConfig = this.createTableConfig()
      this.tableKey += 1
      this.$emit('reload-table')
    }
  }
}
</script>
