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
      default: () => {
      }
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
  data() {
    return {
      defaultRightSideActions: [
        {
          name: 'actionSetting',
          icon: 'system-setting',
          tip: this.$t('TableSetting'),
          has: this.hasColumnSetting,
          callback: this.handleTableSettingClick.bind(this)
        },
        {
          name: 'actionImport',
          icon: 'upload',
          tip: this.$t('Import'),
          has: this.hasImport,
          callback: this.handleImportClick.bind(this)
        },
        {
          name: 'actionExport',
          icon: 'download',
          tip: this.$t('Export'),
          has: this.hasExport,
          callback: this.handleExportClick.bind(this)
        },
        {
          name: 'actionRefresh',
          icon: 'refresh',
          tip: this.$t('Refresh'),
          has: this.hasRefresh,
          callback: this.handleRefreshClick.bind(this)
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
      return assignIfNot(this.exportOptions, { url: this.tableUrl })
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

<style lang="scss" scoped>
.right-side-actions.right-side-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 10px;
  height: 30px;
  line-height: 30px;

  ::v-deep .el-button {
    border: none;
    padding: 7px;
    font-size: 13px;
    color: var(--color-icon-primary);
    background-color: transparent;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }

  ::v-deep .fa {
    height: 16px;
    width: 16px;
  }
}

.table-action-right-side {
  display: flex;
  justify-content: center;
}
</style>
