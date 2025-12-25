<template>
  <div>
    <ActionsGroup
      :actions="rightSideActions"
      :is-fa="true"
      class="right-side-actions right-side-item"
    />
    <ImExportDialog
      v-if="dialogExportVisible"
      :export-options="iExportOptions"
      :import-options="iImportOptions"
      :selected-rows="selectedRows"
      v-bind="$attrs"
      @import-dialog-close="onImportDialogClose"
      @import-dialog-confirm="onImportDialogConfirm"
    />
  </div>
</template>

<script>
import ActionsGroup from '@/components/Common/ActionsGroup/index.vue'
import ImExportDialog from './ImExportDialog.vue'
import { cleanActions } from './utils'
import { assignIfNot } from '@/utils/common/index'

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
    },
    hasQuickFilter: defaultTrue,
    quickFilterExpand: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      defaultHandleExportClick: function ({ selectedRows }) {
        const url = this.iExportOptions.url
        this.dialogExportVisible = true
        this.$nextTick(() => {
          this.$eventBus.$emit('showExportDialog', { selectedRows, url, name: this.name })
        })
      },
      defaultHandleTableSettingClick: function ({ selectedRows }) {
        this.$eventBus.$emit('showColumnSettingPopover', {
          url: this.tableUrl,
          row: selectedRows,
          name: this.name
        })
      },
      defaultHandleRefreshClick: function () {
        this.reloadTable()
      },
      defaultRightSideActions: [
        {
          name: 'actionFilter',
          icon: 'filter',
          tip: this.$t('Filter'),
          has: this.hasQuickFilter,
          callback: this.handleFilterClick.bind(this)
        },
        {
          name: 'actionSetting',
          icon: 'system-setting',
          tip: this.$t('ListPreference'),
          has: this.hasColumnSetting,
          callback: this.handleTableSettingClick || this.defaultHandleTableSettingClick
        },
        {
          name: 'actionImport',
          icon: 'upload',
          tip: this.$t('Import'),
          has: this.hasImport,
          callback: this.handleImportClick || this.defaultHandleImportClick
        },
        {
          name: 'actionExport',
          icon: 'download',
          tip: this.$t('Export'),
          has: this.hasExport,
          callback: this.handleExportClick || this.defaultHandleExportClick
        },
        {
          name: 'actionRefresh',
          icon: 'refresh',
          tip: this.$t('Refresh'),
          has: this.hasRefresh,
          callback: this.handleRefreshClick || this.defaultHandleRefreshClick
        }
      ],
      dialogExportVisible: false
    }
  },
  computed: {
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
    handleFilterClick() {
      this.$emit('update:quick-filter-expand', !this.quickFilterExpand)
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

  :deep(.el-button) {
    border: none;
    padding: 7px;
    font-size: 13px;
    color: var(--color-icon-primary);
    background-color: transparent;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }

  :deep(.fa) {
    height: 16px;
    width: 16px;
  }
}

.table-action-right-side {
  display: flex;
  justify-content: center;
}
</style>
