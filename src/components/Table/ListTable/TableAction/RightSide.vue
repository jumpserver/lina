<template>
  <div>
    <ActionsGroup :actions="rightSideActions" :is-fa="true" class="right-side-actions right-side-item" />
    <ImExportDialog
      :export-options="iExportOptions"
      :import-options="iImportOptions"
      :selected-rows="selectedRows"
      v-bind="$attrs"
      @importDialogClose="onImportDialogClose"
    />
  </div>
</template>

<script>
import ActionsGroup from '@/components/ActionsGroup/index.vue'
import ImExportDialog from './ImExportDialog.vue'
import { cleanActions } from './utils'
import { assignIfNot } from '@/utils/common'

const defaultTrue = { type: Boolean, default: true }

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
      default: function({ selectedRows }) {
        const { exportOptions, tableUrl } = this
        const url = exportOptions?.url ? exportOptions.url : tableUrl
        this.$eventBus.$emit('showExportDialog', { selectedRows, url, name: this.name })
      }
    },
    hasImport: defaultTrue,
    importOptions: {
      type: Object,
      default: () => ({})
    },
    handleImportClick: {
      type: Function,
      default: function({ selectedRows }) {
        const { importOptions, tableUrl } = this
        const url = importOptions?.url ? importOptions.url : tableUrl
        this.$eventBus.$emit('showImportDialog', { selectedRows, url, name: this.name })
      }
    },
    hasColumnSetting: defaultTrue,
    handleTableSettingClick: {
      type: Function,
      default: function({ selectedRows }) {
        this.$eventBus.$emit('showColumnSettingPopover', { url: this.tableUrl, row: selectedRows, name: this.name })
      }
    },
    hasRefresh: defaultTrue,
    handleRefreshClick: {
      type: Function,
      default: function() {
        this.reloadTable()
      }
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
      type: [Boolean, Function],
      default: false
    },
    canBulkUpdate: {
      type: [Boolean, Function],
      default: false
    }
  },
  data() {
    return {
      defaultRightSideActions: [
        { name: 'actionColumnSetting', fa: 'system-setting', tip: this.$t('common.CustomCol'), has: this.hasColumnSetting, callback: this.handleTableSettingClick.bind(this) },
        { name: 'actionImport', fa: 'upload', tip: this.$t('common.Import'), has: this.hasImport, callback: this.handleImportClick.bind(this) },
        { name: 'actionExport', fa: 'download', tip: this.$t('common.Export'), has: this.hasExport, callback: this.handleExportClick.bind(this) },
        { name: 'actionRefresh', fa: 'refresh', tip: this.$t('common.Refresh'), has: this.hasRefresh, callback: this.handleRefreshClick.bind(this) }
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
      const options = assignIfNot(this.exportOptions, { url: this.tableUrl })
      return options
    }
  },
  methods: {
    handleTagSearch(val) {
      this.searchTable(val)
    },
    onImportDialogClose() {
      this.$emit('importDialogClose')
      this.reloadTable()
    }
  }
}
</script>

<style scoped>
  .table-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .right-side-item {
    padding-top: 4px;
  }

  .right-side-actions >>> .el-button {
    border: none;
    padding: 5px;
    font-size: 14px;
    width: 26px;
    height: 26px;
    color: #888;
    background-color: transparent;
  }

  .right-side-actions >>> .fa {
    height: 16px;
    width: 16px;
  }

  .right-side-actions >>> .el-button:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .action-search >>> .el-input__suffix i {
    font-weight: 500;
    color: #888;
  }

  .right-side-actions {
    display: flex;
    padding-left: 10px;
    align-items: center;
    justify-content:center;
  }

  .table-action-right-side {
    display: flex;
    justify-content:center;
  }

</style>
