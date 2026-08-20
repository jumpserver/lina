<template>
  <div>
    <ActionsGroup
      :actions="rightSideActions"
      :is-fa="true"
      class="right-side-actions right-side-item"
    />
    <ImExportDialog
      v-bind="$attrs"
      v-if="dialogExportVisible"
      :export-options="iExportOptions"
      :import-options="iImportOptions"
      :selected-rows="selectedRows"
      @import-dialog-close="onImportDialogClose"
      @import-dialog-confirm="onImportDialogConfirm"
    />
  </div>
</template>

<script>
import ActionsGroup from '@/components/Common/ActionsGroup/index.vue'
import { assignIfNot } from '@/utils/common/index'
import ImExportDialog from './ImExportDialog.vue'
import { cleanActions } from './utils'

const defaultTrue = { type: [Boolean, Function, String], default: true }

export default {
  name: 'RightSide',
  components: {
    ActionsGroup,
    ImExportDialog
  },
  props: {
    tableUrl: {
      type: String,
      default: ''
    },
    hasExport: defaultTrue,
    exportOptions: {
      type: Object,
      default: () => ({})
    },
    handleExportClick: {
      type: Function,
      default: null
    },
    hasImport: defaultTrue,
    importOptions: {
      type: Object,
      default: () => ({})
    },
    handleImportClick: {
      type: Function,
      default: null
    },
    hasColumnSetting: defaultTrue,
    handleTableSettingClick: {
      type: Function,
      default: null
    },
    hasRefresh: defaultTrue,
    handleRefreshClick: {
      type: Function,
      default: null
    },
    selectedRows: {
      type: Array,
      default: () => []
    },
    reloadTable: {
      type: Function,
      default: () => {}
    },
    extraRightSideActions: {
      type: Array,
      default: () => []
    },
    canCreate: {
      type: [Boolean, Function, String],
      default: false
    },
    canBulkUpdate: {
      type: [Boolean, Function, String],
      default: false
    }
  },
  emits: ['importDialogClose'],
  data() {
    return {
      dialogExportVisible: false
    }
  },
  computed: {
    defaultRightSideActions() {
      return [
        {
          name: 'actionSetting',
          icon: 'system-setting',
          tip: this.$t('ListPreference'),
          has: this.hasColumnSetting,
          callback: this.handleTableSettingClick || this.defaultHandleTableSettingClickFn
        },
        {
          name: 'actionImport',
          icon: 'upload',
          tip: this.$t('Import'),
          has: this.hasImport,
          callback: this.handleImportClick || this.defaultHandleImportClickFn
        },
        {
          name: 'actionExport',
          icon: 'download',
          tip: this.$t('Export'),
          has: this.hasExport,
          callback: this.handleExportClick || this.defaultHandleExportClickFn
        },
        {
          name: 'actionRefresh',
          icon: 'refresh',
          tip: this.$t('Refresh'),
          has: this.hasRefresh,
          callback: this.handleRefreshClick || this.defaultHandleRefreshClickFn
        }
      ]
    },
    rightSideActions() {
      const actions = [...this.defaultRightSideActions, ...this.extraRightSideActions]
      const params = {
        selectedRows: this.selectedRows,
        reloadTable: this.reloadTable
      }
      return cleanActions(actions, true, params)
    },
    hasSelectedRows() {
      return this.selectedRows.length > 0
    },
    iImportOptions() {
      return assignIfNot(this.importOptions, {
        url: this.tableUrl,
        canImportCreate: this.canCreate,
        canImportUpdate: this.canBulkUpdate
      })
    },
    iExportOptions() {
      /**
       *  原本是使用 assignIfNot 此函数内部使用 partialRight, 该函数
       *  只在目标对象的属性未定义时才从源对象复制属性，如果目标对象已经有值，则保留原值
       *  那如果首次点击的树节点，那么此时 url 就会被确定，后续点击的树节点，那么 url 就将不会携带节点信息
       *
       */
      // return assignIfNot(this.exportOptions, { url: this.tableUrl })

      return {
        url: this.tableUrl,
        ...this.exportOptions
      }
    }
  },
  methods: {
    defaultHandleExportClickFn({ selectedRows }) {
      const url = this.iExportOptions.url
      this.dialogExportVisible = true
      this.$nextTick(() => {
        this.$eventBus.$emit('showExportDialog', { selectedRows, url, name: this.name })
      })
    },
    defaultHandleTableSettingClickFn({ selectedRows }) {
      this.$eventBus.$emit('showColumnSettingPopover', {
        url: this.tableUrl,
        row: selectedRows,
        name: this.name
      })
    },
    defaultHandleImportClickFn() {
      this.dialogExportVisible = true
      this.$nextTick(() => {
        this.$eventBus.$emit('showImportDialog')
      })
    },
    defaultHandleRefreshClickFn() {
      this.reloadTable()
    },
    handleTagSearch(val) {
      this.searchTable(val)
    },
    onImportDialogClose() {
      this.$emit('importDialogClose')
      setTimeout(() => {
        this.dialogExportVisible = false
      }, 100)
      this.reloadTable()
    },
    onImportDialogConfirm() {
      this.$emit('importDialogClose')
      setTimeout(() => {
        this.dialogExportVisible = false
      }, 100)
      this.reloadTable()
    }
  }
}
</script>

<style lang="scss" scoped>
.right-side-actions.right-side-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  line-height: 30px;

  :deep(.layout) {
    display: flex;
    align-items: center;
  }

  :deep(.action-item.el-button),
  :deep(.action-item.el-dropdown > .el-button),
  :deep(.action-item.el-dropdown .el-button-group .el-button) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 30px;
    height: 30px;
    padding: 0;
  }

  :deep(.action-item.el-button > span),
  :deep(.action-item.el-dropdown > .el-button > span),
  :deep(.action-item.el-dropdown .el-button-group .el-button > span) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    line-height: 1;
  }

  :deep(.el-button) {
    border: none;
    padding: 7px;
    font-size: 13px;
    color: var(--color-text-primary) !important;
    background-color: transparent;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }

  :deep(.svg-icon),
  :deep(.pre-icon),
  :deep(.el-icon),
  :deep(.fa) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 13px;
    height: 13px;
    margin: 0 !important;
    font-size: 13px;
    color: var(--color-text-primary) !important;
  }

  // 纯图标按钮：el-button 内部还隔着 el-tooltip__trigger 和一层 div，
  // 外层 button 的 flex 居中不会自动传导到图标；这里把中间链路都撑满并居中。
  :deep(.action-item .el-tooltip__trigger),
  :deep(.action-item .el-tooltip__trigger > div) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    line-height: 1;
  }

  // 无标题时那个空 <span> 仍带 DataActions 的 margin-left:3px，会把图标挤离中心。
  // 图标工具栏里标题恒为空，直接去掉该 span 及其 margin，图标即可真正居中。
  :deep(.action-item .pre-icon + span) {
    margin-left: 0;
  }

  :deep(.action-item .pre-icon + span:empty) {
    display: none;
  }
}

.table-action-right-side {
  display: flex;
  justify-content: center;
}
</style>
