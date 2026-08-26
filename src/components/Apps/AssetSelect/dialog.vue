<template>
  <Dialog
    v-bind="dialogAttrs"
    :close-on-click-modal="false"
    :visible="visible"
    :title="$tc('AssetManagement')"
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
        hasRefresh: false,
        hasLabelSearch: true,
        searchConfig: {
          getUrlQuery: false
        }
      }
    }
  },
  computed: {
    dialogAttrs() {
      return { ...this.$attrs }
    },
    iTreeSetting() {
      return {
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
   - 左:资产树侧栏,满高(tab 作头部);右:搜索 + 表格,自带内边距。
   - 高度随右侧表格自然铺开,竖线满高,分页贴底,无多余空白。
   ===================================================================== */
.asset-dialog.el-dialog {
  display: flex;
  flex-direction: column;
  height: min(680px, 94vh);

  // Dialog 组件全局有 `.el-dialog.dialog .el-dialog__body { padding:20px 30px!important }`(0,3,0),
  // 这里必须用更高优先级(0,4,0)才能压过它,让内容真正满幅铺到边缘。
  &.dialog .el-dialog__body {
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

  .el-dialog__body > .el-loading-parent--relative {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }

  .page-heading {
    display: none;
  }

  .tree-table {
    flex: 1 1 auto;
    display: flex;
    align-items: stretch;
    height: 100%;
    min-height: 0;
  }

  .tree-table.tree-table-content {
    height: 100%;
  }

  // ---------- 左:资产树 / 类型树 侧栏 ----------
  .tree-table .left {
    position: relative; // 锚点:树体绝对定位、不参与撑高,侧栏高度自动 = 右侧表格高度
    border-right: 1px solid var(--color-border); // 中间贯穿竖线

    // tab + 树体铺满整个侧栏
    .auto-data-ztree.tree-tab {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
    }

    // tab 作侧栏头部:左右留白
    .page-submenu {
      flex: 0 0 auto;
      padding: 0 16px;
    }

    // 树体:填满头部下方并独立滚动
    .data-z-tree {
      flex: 1 1 auto;
      min-height: 0;
      padding: 8px 12px;
      overflow: auto;
    }

    .ztree,
    .treebox {
      height: auto !important;
    }
  }

  // ---------- 右:搜索 + 表格 ----------
  .tree-table .right {
    display: flex;
    min-width: 0; // 允许表格在弹窗内正确收缩
    min-height: 0;

    // 折叠按钮隐藏后,表格区填满右栏
    .transition-box {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-width: 0;
      min-height: 0;
      padding: 14px 20px;
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
    }

    .table-content > .el-card,
    .table-content > .el-card > .el-card__body,
    .auto-data-table,
    .auto-data-table > .el-loading-parent--relative,
    .auto-data-table .el-data-table {
      height: 100%;
      min-height: 0;
    }

    .auto-data-table .el-data-table {
      gap: 4px;
    }

    .auto-data-table .el-data-table > .el-loading-parent--relative {
      flex: 1 1 auto;
      min-height: 0;
    }

    .el-data-table .el-pagination {
      flex: 0 0 auto;
      padding: 6px 0 0;
    }

    // 顶部工具栏:把「标签按钮 + 搜索框」收成一个统一边框的紧凑控件(按内容宽度,不拉满整行),
    // 消除并排小框与框中框(标签按钮自带边框、搜索框自带边框、框内 / 徽标又带边框)。
    .search {
      flex: 0 0 auto; // 按内容宽度收紧,右侧多余空间归工具栏(无边框),避免拉出空的带框盒子
      width: auto;
      margin-right: 0; // 覆盖全局 `.container:not(:has(.left-side)) .search { margin-right:auto }`
      margin-left: auto; // 将搜索控件推到工具栏右侧
      align-items: center;
      min-height: 30px;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      background-color: #fff;

      .label-search {
        margin-right: 0;
      }

      // 标签按钮:去掉自身边框,仅以一条右分隔线与搜索框分隔
      .label-button {
        height: 28px;
        border: none !important;
        border-right: 1px solid var(--color-border) !important;
        border-radius: 0 !important;
      }

      // 搜索框:去掉自身外层边框(统一由 .search 提供),保持其自然宽度
      .right-side-item.action-search {
        border: none !important;
        border-radius: 0 !important;
      }

      // 隐藏搜索框内的「/」快捷键徽标(自带边框,嵌在搜索框内形成框中框)
      .keydown-focus {
        display: none;
      }
    }
  }

  // 满幅主从布局下树折叠按钮意义不大,隐藏以保持整洁
  .tree-table .mini {
    display: none;
  }
}
</style>
