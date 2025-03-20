<template>
  <Dialog
    :close-on-click-modal="false"
    :title="$tc('Assets')"
    custom-class="asset-select-dialog"
    top="2vh"
    v-bind="$attrs"
    width="1000px"
    @cancel="handleCancel"
    @close="handleClose"
    @confirm="handleConfirm"
    v-on="$listeners"
  >
    <AssetTreeTable
      ref="ListPage"
      :header-actions="headerActions"
      :node-url="baseNodeUrl"
      :sync-select-to-url="false"
      :table-config="tableConfig"
      :tree-setting="iTreeSetting"
      :tree-url="`${baseNodeUrl}children/tree/`"
      :url="baseUrl"
      class="tree-table"
      v-bind="$attrs"
      @loaded="handleTableLoaded"
      v-on="$listeners"
    />
  </Dialog>
</template>

<script>
import AssetTreeTable from '@/components/Apps/AssetTreeTable/index.vue'
import Dialog from '@/components/Dialog/index.vue'

export default {
  componentName: 'AssetSelectDialog',
  components: { AssetTreeTable, Dialog },
  props: {
    baseUrl: {
      type: String,
      default: '/api/v1/assets/assets/'
    },
    baseNodeUrl: {
      type: String,
      default: '/api/v1/assets/nodes/'
    },
    value: {
      type: Array,
      default: () => []
    },
    canSelect: {
      type: Function,
      default(row, index) {
        return true
      }
    },
    disabled: {
      type: [Boolean, Function],
      default: false
    },
    treeSetting: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const vm = this
    return {
      isLoaded: false,
      dialogVisible: false,
      rowSelected: _.cloneDeep(this.value) || [],
      rowsAdd: [],
      tableConfig: {
        url: this.baseUrl,
        hasTree: true,
        canSelect: this.canSelect,
        columns: [
          {
            prop: 'name',
            label: this.$t('Name'),
            sortable: true
          },
          {
            prop: 'address',
            label: this.$t('Address'),
            sortable: 'custom'
          },
          {
            prop: 'platform',
            label: this.$t('Platform'),
            sortable: true,
            formatter: function(row) {
              return row.platform.name
            }
          },
          {
            prop: 'actions',
            has: false
          }
        ],
        listeners: {
          'toggle-row-selection': (isSelected, row) => {
            if (isSelected) {
              vm.addRowToSelect(row)
            } else {
              vm.removeRowFromSelect(row)
            }
          }
        },
        theRowDefaultIsSelected: (row) => {
          return this.value.indexOf(row.id) > -1
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasRightActions: false,
        hasLabelSearch: true,
        searchConfig: {
          getUrlQuery: false
        }
      }
    }
  },
  computed: {
    iTreeSetting() {
      return { ...this.treeSetting, selectSyncToRoute: false }
    }
  },
  methods: {
    handleTableLoaded() {
      this.isLoaded = true
    },
    handleClose() {
      this.$refs.ListPage.$refs.TreeList.componentKey += 1
    },
    handleConfirm() {
      this.$emit('confirm', this.rowSelected, this.rowsAdd)
      if (this.rowSelected.length > 0) {
        this.handleClose()
      }
    },
    handleCancel() {
      this.$emit('cancel')
      this.handleClose()
    },
    addRowToSelect(row) {
      const selectValueIndex = this.rowSelected.indexOf(row.id)
      if (selectValueIndex === -1) {
        this.rowSelected.push(row.id)
        this.rowsAdd.push(row)
      }
    },
    removeRowFromSelect(row) {
      const selectValueIndex = this.rowSelected.indexOf(row.id)
      if (selectValueIndex > -1) {
        this.rowSelected.splice(selectValueIndex, 1)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page ::v-deep .page-heading {
  display: none;
}

.el-dialog__wrapper ::v-deep .el-dialog__body {
  padding: 0 0 0 3px;

  .tree-table {
    .search {
    }

    .left {
      padding: 5px;
    }

    .right {
      min-height: 500px;
      overflow: auto;
    }

    .mini {
      padding-top: 8px;
    }

    .transition-box {
      padding: 10px 5px;
    }
  }
}

.page ::v-deep .treebox .ztree {

}

.asset-select-dialog ::v-deep .el-icon-circle-check {
  display: none;
}
</style>
