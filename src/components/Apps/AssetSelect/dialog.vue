<template>
  <Dialog
    v-bind="dialogAttrs"
    :close-on-click-modal="false"
    :visible="visible"
    :title="dialogTitle"
    :class="['asset-dialog', { 'asset-dialog--danger-selection': dangerSelection }]"
    max-width="1000px"
    top="3vh"
    width="72vw"
    @cancel="handleCancel"
    @close="handleClose"
    @confirm="handleConfirm"
    @update:visible="handleVisibleChange"
  >
    <AssetTreeTable
      ref="ListPage"
      :header-actions="headerActions"
      :mount-tree="showTree"
      :node-url="baseNodeUrl"
      :auto-fit-tree-width="showTree"
      :show-tree="showTree"
      :sync-select-to-url="false"
      :table-config="tableConfig"
      :tree-setting="iTreeSetting"
      :tree-url-query="treeUrlQuery"
      :tree-url="`${baseNodeUrl}children/tree/`"
      :tree-min-width="280"
      tree-width="300px"
      :url="baseUrl"
      class="tree-table"
    >
      <template v-if="showSelectedItems" #search-after>
        <el-popover
          v-model:visible="selectedItemsVisible"
          :width="360"
          placement="bottom-start"
          :popper-class="selectedItemsPopperClass"
          trigger="click"
        >
          <div class="asset-selected-items">
            <div class="asset-selected-items__header">
              {{ $t('AssetSelectSelectedCount', { count: rowSelected.length }) }}
            </div>
            <el-scrollbar class="asset-selected-items__scroll" max-height="260px">
              <div v-if="rowsAdd.length" class="asset-selected-items__list">
                <div v-for="row in rowsAdd" :key="row.id" class="asset-selected-items__row">
                  <el-checkbox
                    :model-value="isRowSelected(row)"
                    @change="toggleSelectedItem(row, $event)"
                  >
                    <span :title="getRowName(row)" class="asset-selected-items__name">
                      {{ getRowName(row) }}
                    </span>
                  </el-checkbox>
                </div>
              </div>
              <el-empty
                v-else
                :description="$t('ResourceSelectEmpty')"
                :image-size="48"
                class="asset-selected-items__empty"
              />
            </el-scrollbar>
          </div>
          <template #reference>
            <el-button class="asset-selected-items__trigger">
              <span>{{ $t('ResourceSelectSelected') }} ({{ rowSelected.length }})</span>
              <el-icon
                :class="{ 'is-open': selectedItemsVisible }"
                class="asset-selected-items__arrow"
              >
                <ArrowDown />
              </el-icon>
            </el-button>
          </template>
        </el-popover>
      </template>
    </AssetTreeTable>
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
    initialTreeData: {
      type: Array,
      default: () => []
    },
    initialTreeAmounts: {
      type: Object,
      default: () => ({})
    },
    initialTreeAssetScope: {
      type: [String, Number],
      default: ''
    },
    showTree: {
      type: Boolean,
      default: true
    },
    showSelectedItems: {
      type: Boolean,
      default: false
    },
    plainTextCells: {
      type: Boolean,
      default: false
    },
    dangerSelection: {
      type: Boolean,
      default: false
    },
    pageSize: {
      type: Number,
      default: 10
    }
  },
  data() {
    const vm = this
    return {
      selectedItemsVisible: false,
      keepRowOnDeselect: false,
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
        plainTextCells: this.plainTextCells,
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
              vm.removeRowFromSelect(row, !vm.keepRowOnDeselect)
            }
          }
        },
        theRowDefaultIsSelected: (row) => {
          return vm.isRowSelected(row)
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
    selectedItemsPopperClass() {
      return [
        'asset-selected-items-popper',
        this.dangerSelection ? 'asset-selected-items-popper--danger' : ''
      ]
        .filter(Boolean)
        .join(' ')
    },
    iTreeSetting() {
      return {
        showCollapse: true,
        showAssetScope: true,
        assetScopeStorageKey: 'asset_select_dialog_show_current_asset',
        ...this.treeSetting,
        initialData: this.initialTreeData,
        initialAmounts: this.initialTreeAmounts,
        initialAssetScope: this.initialTreeAssetScope,
        readOnly: true,
        showMenu: false,
        hasRightMenu: false,
        edit: {
          ...this.treeSetting.edit,
          drag: {
            ...this.treeSetting.edit?.drag,
            isMove: false
          }
        },
        selectSyncToRoute: false
      }
    }
  },
  watch: {
    selectedItemsVisible(visible) {
      if (!visible) {
        this.pruneDeselectedRows()
      }
    }
  },
  methods: {
    handleClose() {
      this.$refs.ListPage.$refs.TreeList.componentKey += 1
    },
    handleVisibleChange(val) {
      if (!val) {
        this.selectedItemsVisible = false
      }
      this.$emit('update:visible', val)
    },
    handleConfirm() {
      this.pruneDeselectedRows()
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
      const selectValueIndex = this.findSelectedIndex(row.id)
      if (selectValueIndex === -1) {
        this.rowSelected.push(row.id)
      }
      const rowIndex = this.rowsAdd.findIndex((item) => String(item.id) === String(row.id))
      if (rowIndex === -1) {
        this.rowsAdd.push(row)
      } else {
        this.rowsAdd.splice(rowIndex, 1, { ...this.rowsAdd[rowIndex], ...row })
      }
    },
    removeRowFromSelect(row, removeCachedRow = true) {
      const selectValueIndex = this.findSelectedIndex(row.id)
      if (selectValueIndex > -1) {
        this.rowSelected.splice(selectValueIndex, 1)
      }
      if (removeCachedRow) {
        const rowIndex = this.rowsAdd.findIndex((item) => String(item.id) === String(row.id))
        if (rowIndex > -1) {
          this.rowsAdd.splice(rowIndex, 1)
        }
      }
    },
    findSelectedIndex(id) {
      return this.rowSelected.findIndex((item) => String(item) === String(id))
    },
    isRowSelected(row) {
      return this.findSelectedIndex(row?.id) > -1
    },
    getRowName(row) {
      return row?.name || String(row?.id || '')
    },
    pruneDeselectedRows() {
      this.rowsAdd = this.rowsAdd.filter((row) => this.isRowSelected(row))
    },
    toggleSelectedItem(row, isSelected) {
      const listPage = this.$refs.ListPage
      if (typeof listPage?.toggleRowSelection === 'function') {
        this.keepRowOnDeselect = true
        try {
          listPage.toggleRowSelection(row, isSelected)
        } finally {
          this.keepRowOnDeselect = false
        }
        return
      }
      if (isSelected) {
        this.addRowToSelect(row)
      } else {
        this.removeRowFromSelect(row, false)
      }
    }
  }
}
</script>

<style lang="scss">
// 资产选择弹窗采用固定高度的双栏布局，树与表格各自管理滚动区域。
.asset-dialog.el-dialog {
  display: flex;
  flex-direction: column;
  height: min(620px, 94vh);

  // 提高选择器优先级，覆盖 Dialog 的默认 body padding。
  &.dialog .el-dialog__body {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    padding: 0 !important;
    overflow: hidden;
  }

  .el-dialog__header {
    padding: 14px 24px !important;
  }

  .el-dialog__footer {
    padding: 8px 24px !important;
  }

  .asset-selected-items__trigger {
    height: 30px;
    margin: 0;
    padding: 0 10px;
    color: var(--color-text-primary) !important;
    border-color: var(--color-border);
    background-color: #fff;

    > span {
      display: flex;
      align-items: center;
    }

    .el-icon {
      color: var(--el-text-color-secondary);
    }

    &:hover,
    &:focus,
    &:focus-visible,
    &:active {
      color: var(--color-text-primary) !important;
      border-color: var(--color-border);
      background-color: rgba(0, 0, 0, 0.05);

      .el-icon {
        color: var(--el-text-color-secondary);
      }
    }
  }

  .asset-selected-items__arrow {
    flex: 0 0 auto;
    margin-left: 6px;
    transition: transform 0.15s ease-out;

    &.is-open {
      transform: rotate(180deg);
    }
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
    height: auto;
    min-height: 0;
    margin: 4px 0 14px 8px;
    overflow: hidden;
    border: 1px solid var(--color-border);
    border-radius: var(--el-card-border-radius, 4px);

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
      height: 36px;
      padding-left: 16px;
      min-width: 0;
      overflow: hidden;

      &.has-tree-actions {
        padding-right: 42px;
      }
    }

    .tree-view-selector {
      overflow: hidden;
    }

    .x-tree__header-actions {
      right: 6px;
      gap: 0;
    }

    .x-tree__tool-button {
      width: 28px;
      min-width: 28px;
      height: 28px;
      padding: 4px;
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
      padding: 4px 20px 14px 8px;
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
    .auto-data-table > .auto-data-table__content,
    .auto-data-table .el-data-table {
      height: 100%;
      min-height: 0;
    }

    .table-content > .el-card {
      border: 1px solid var(--el-border-color-lighter);
      box-shadow: none;
    }

    // 卡片已经提供完整的四周边框，移除表格自身重复绘制的上、左、右外边框。
    .table-content .el-table--border::before,
    .table-content .el-table--border::after,
    .table-content .el-table--border > .el-table__inner-wrapper::after,
    .table-content .el-table__border-left-patch,
    .table-content .el-table__border-right-patch {
      display: none;
    }

    .auto-data-table .el-data-table {
      gap: 4px;
    }

    .auto-data-table .el-data-table > .el-data-table__surface {
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
    }

    .el-data-table .el-pagination {
      flex: 0 0 auto;
      box-sizing: border-box;

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

.asset-selected-items-popper.el-popper {
  padding: 0;
  overflow: hidden;
  border-color: var(--el-border-color-light);
  border-radius: 6px;
  box-shadow: var(--el-box-shadow-light);
}

.asset-dialog--danger-selection,
.asset-selected-items-popper--danger {
  .el-checkbox {
    --el-checkbox-checked-input-border-color: var(--el-color-danger);
    --el-checkbox-checked-bg-color: var(--el-color-danger);
    --el-checkbox-input-border-color-hover: var(--el-color-danger);
  }
}

.asset-selected-items {
  color: var(--el-text-color-regular);
  background: var(--el-bg-color);
}

.asset-selected-items__header {
  display: flex;
  align-items: center;
  height: 42px;
  padding: 0 14px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.asset-selected-items__scroll {
  max-height: 260px;

  .el-scrollbar__wrap {
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .el-scrollbar__bar.is-horizontal {
    display: none;
  }
}

.asset-selected-items__list {
  width: max-content;
  min-width: 100%;
  padding: 6px;
}

.asset-selected-items__row {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: max-content;
  min-width: 100%;
  height: 34px;
  padding: 0 8px;
  border-radius: 4px;

  &:hover {
    background: var(--el-fill-color-light);
  }

  .el-checkbox {
    width: max-content;
    min-width: 100%;
  }

  .el-checkbox__label {
    padding-left: 8px;
  }
}

.asset-selected-items__name {
  display: block;
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

.asset-selected-items__empty {
  padding: 18px 0;
}
</style>
