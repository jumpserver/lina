<template>
  <Dialog
    v-bind="dialogAttrs"
    :close-on-click-modal="false"
    :visible="visible"
    :title="dialogTitle"
    class="asset-dialog"
    max-width="1100px"
    top="3vh"
    width="78vw"
    @cancel="handleCancel"
    @close="handleClose"
    @confirm="handleConfirm"
    @update:visible="handleVisibleChange"
  >
    <AssetTreeTable
      ref="ListPage"
      :header-actions="headerActions"
      :node-url="baseNodeUrl"
      :sync-select-to-url="false"
      :table-config="tableConfig"
      :tree-setting="iTreeSetting"
      :tree-url-query="treeUrlQuery"
      :tree-url="`${baseNodeUrl}children/tree/`"
      :url="baseUrl"
      class="tree-table"
      @loaded="handleTableLoaded"
    />
  </Dialog>
</template>

<script>
import AssetTreeTable from '@/components/Apps/AssetTreeTable/index.vue'
import Dialog from '@/components/Dialog/index.vue'

export default {
  componentName: 'AssetSelectDialog',
  components: { AssetTreeTable, Dialog },
  inheritAttrs: false,
  emits: ['cancel', 'confirm', 'update:visible'],
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
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
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
    treeUrlQuery: {
      type: Object,
      default: () => ({})
    },
    treeSetting: {
      type: Object,
      default: () => ({})
    },
    pageSize: {
      type: Number,
      default: 10
    }
  },
  data() {
    const vm = this
    return {
      isLoaded: false,
      rowSelected: _.cloneDeep(this.value) || [],
      rowsAdd: [],
      tableConfig: {
        name: `AssetSelectDialog_${new URL(this.baseUrl, location.origin).pathname.replaceAll(
          '/',
          '_'
        )}`,
        url: this.baseUrl,
        hasTree: true,
        canSelect: this.canSelect,
        savePageSize: false,
        paginationSize: Math.min(Math.max(this.pageSize, 1), 100),
        paginationSizes: [10, 20, 50, 100],
        tableAttrs: {
          height: '100%',
          scrollbarAlwaysOn: true
        },
        columnsShow: {
          default: ['name', 'address', 'platform'],
          min: ['name']
        },
        columnsMeta: {
          platform: {
            formatter: (row) => row.platform?.name || ''
          },
          actions: {
            has: false
          }
        },
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
        hasRightActions: true,
        hasColumnSetting: true,
        hasImport: false,
        hasExport: false,
        hasRefresh: true,
        hasLabelSearch: true,
        searchConfig: {
          getUrlQuery: false
        }
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.title || this.$tc('AssetManagement')
    },
    dialogAttrs() {
      return { ...this.$attrs }
    },
    iTreeSetting() {
      return {
        showCollapse: false,
        showAssetScope: true,
        assetScopeStorageKey: 'asset_select_dialog_show_current_asset',
        ...this.treeSetting,
        selectSyncToRoute: false
      }
    }
  },
  methods: {
    handleTableLoaded() {
      this.isLoaded = true
    },
    handleClose() {
      this.$refs.ListPage.$refs.TreeList.componentKey += 1
    },
    handleVisibleChange(val) {
      this.$emit('update:visible', val)
    },
    handleConfirm() {
      this.$emit('update:visible', false)
      this.$emit('confirm', this.rowSelected, this.rowsAdd)
      if (this.rowSelected.length > 0) {
        this.handleClose()
      }
    },
    handleCancel() {
      this.$emit('update:visible', false)
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

<style lang="scss">
/* =====================================================================
   资产选择弹窗 —— 满幅「主从」布局
   - body 与双栏容器都不留 padding:内容铺到弹窗内容区边缘。
     框架由标题栏底线、底部按钮栏顶线,以及中间一条贯穿竖线共同构成,
     不再用浮动卡片,也就没有卡片边框内的空洞。
   - 左:资产树侧栏,始终占满弹窗内容区;右:搜索 + 表格,自带内边距。
   - 双栏使用弹窗固定内容高度,互不依赖内容高度,分页贴底。
   ===================================================================== */
.asset-dialog.el-dialog {
  display: flex;
  flex-direction: column;
  height: min(680px, 94vh);

  // Dialog 组件全局有 `.el-dialog.dialog .el-dialog__body { padding:20px 30px!important }`(0,3,0),
  // 这里必须用更高优先级(0,4,0)才能压过它,让内容真正满幅铺到边缘。
  &.dialog .el-dialog__body {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    padding: 0 !important;
    overflow: hidden;
  }

  .el-dialog__header {
    padding: 10px 24px !important;
  }

  .el-dialog__footer {
    padding: 8px 24px !important;
  }

  .el-dialog__body > div {
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    width: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .page-heading {
    display: none;
  }

  .tree-table {
    flex: 1 1 0;
    display: flex;
    align-items: stretch;
    height: auto !important;
    min-height: 0;
    overflow: hidden;
  }

  .tree-table.tree-table-content {
    flex: 1 1 0;
  }

  // ---------- 左:资产树 / 类型树 侧栏 ----------
  .tree-table > .left {
    position: relative;
    align-self: stretch;
    height: 100%;
    min-height: 0;
    border-right: 1px solid var(--color-border); // 中间贯穿竖线

    // tab + 树体铺满整个侧栏
    .auto-data-ztree.tree-tab {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
    }

    .x-tree {
      height: 100% !important;
      min-height: 0 !important;
    }

    // 树视图选择器作为侧栏头部，保留右侧工具按钮空间。
    .tree-view-header {
      flex: 0 0 auto;
      padding-left: 16px;
    }

    // 树体:填满头部下方并独立滚动
    .data-z-tree {
      flex: 1 1 auto;
      min-height: 0;
      padding: 8px 12px;
      overflow: hidden;
    }

    .ztree,
    .treebox {
      height: auto !important;
    }
  }

  // ---------- 右:搜索 + 表格 ----------
  .tree-table > .right {
    display: flex;
    align-self: stretch;
    height: 100%;
    min-width: 0; // 允许表格在弹窗内正确收缩
    min-height: 0;

    // 折叠按钮隐藏后,表格区填满右栏
    .transition-box {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-width: 0;
      min-height: 0;
      padding: 14px 20px 14px 8px;
    }

    .transition-box > div {
      display: flex;
      flex: 1 1 auto;
      flex-direction: column;
      width: 100%;
      min-height: 0;
      overflow: hidden;
    }

    .list-table {
      flex: 1 1 auto;
      height: 100%;
      min-height: 0;
      gap: 6px;
    }

    .table-content {
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
    }

    .table-content > .el-card,
    .table-content > .el-card > .el-card__body,
    .auto-data-table,
    .auto-data-table > div:first-child,
    .auto-data-table .el-data-table {
      height: 100%;
      min-height: 0;
    }

    .auto-data-table .el-data-table {
      gap: 4px;
    }

    .auto-data-table .el-data-table > div:first-child {
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
    }

    .el-data-table .el-pagination {
      flex: 0 0 auto;
      box-sizing: border-box;
      min-height: 48px;
      padding: 10px 20px 12px;

      .el-pagination__total {
        margin-right: auto;
      }

      .el-pagination__sizes {
        margin-left: 12px;
      }
    }
  }

  // 弹窗内始终保留资产树，仅允许拖动分隔线调整宽度。
  .tree-table .mini,
  .tree-table .tree-toggle {
    display: none;
  }
}
</style>
