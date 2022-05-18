<template>
  <div class="asset-select-dialog">
    <Dialog
      v-if="iVisible"
      :title="this.$t('assets.Assets')"
      :visible.sync="iVisible"
      width="70%"
      top="1vh"
      @confirm="assetTreeTableDialogHandleConfirm"
      @cancel="assetTreeTableDialogHandleCancel"
    >
      <TreeTable
        ref="TreeTable"
        :tree-setting="treeSetting"
        :table-config="tableConfig"
        :header-actions="headerActions"
      />
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog'
import TreeTable from '@/components/TreeTable'
import { DetailFormatter } from '@/components/TableFormatters'
import $ from '@/utils/jquery-vendor'
export default {
  name: 'NodeAssetsUpdate',
  components: {
    Dialog,
    TreeTable
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    action: {
      type: String,
      default: 'add'
    },
    selectNode: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      dialogVisible: false,
      assetsSelected: [],
      treeSetting: {
        showMenu: false,
        showRefresh: true,
        showAssets: false,
        url: '/api/v1/assets/assets/?fields_size=mini',
        nodeUrl: '/api/v1/assets/nodes/',
        // ?assets=0不显示资产. =1显示资产
        treeUrl: '/api/v1/assets/nodes/children/tree/?assets=0'
      },
      tableConfig: {
        url: '/api/v1/assets/assets/',
        hasTree: true,
        columns: [
          {
            prop: 'hostname',
            label: this.$t('assets.Hostname'),
            sortable: true,
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AssetDetail'
            }
          },
          {
            prop: 'ip',
            label: this.$t('assets.ip'),
            sortable: 'custom'
          }
        ],
        listeners: {
          'toggle-row-selection': (isSelected, row) => {
            if (isSelected) {
              this.addRowToAssetsSelected(row)
            } else {
              this.removeRowFromAssetsSelected(row)
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasRightActions: false
      }
    }
  },
  computed: {
    iVisible: {
      set(val) {
        this.$parent?.hideMenu()
        this.$emit('update:visible', val)
      },
      get() {
        return this.visible
      }
    }
  },
  methods: {
    addRowToAssetsSelected(row) {
      const selectValueIndex = this.assetsSelected.indexOf(row.id)
      if (selectValueIndex === -1) {
        this.assetsSelected.push(row.id)
      }
    },
    removeRowFromAssetsSelected(row) {
      const selectValueIndex = this.assetsSelected.indexOf(row.id)
      if (selectValueIndex > -1) {
        this.assetsSelected.splice(selectValueIndex, 1)
      }
    },
    assetTreeTableDialogHandleConfirm() {
      const currentNode = this.selectNode
      const assetsSelected = this.assetsSelected
      if (!currentNode || assetsSelected.length === 0) {
        return
      }
      let url = `/api/v1/assets/nodes/${currentNode.meta.data.id}/assets/add/`
      if (this.action === 'move') {
        url = `/api/v1/assets/nodes/${currentNode.meta.data.id}/assets/replace/`
      }
      this.$axios.put(
        url, { assets: assetsSelected }
      ).then(res => {
        this.iVisible = false
        this.assetsSelected = []
        $('#tree-refresh').trigger('click')
        this.$message.success(this.$t('common.updateSuccessMsg'))
      }).catch(error => {
        this.$parent?.hideMenu()
        this.$message.error(this.$t('common.updateErrorMsg' + ' ' + error))
      })
    },
    assetTreeTableDialogHandleCancel() {
      this.iVisible = false
      this.assetsSelected = []
    }
  }
}
</script>

<style scoped>

</style>
