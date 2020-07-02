<template>
  <div>
    <ActionsGroup :is-fa="true" :actions="rightSideActions" class="right-side-actions right-side-item" />
    <ImExportDialog :selected-rows="selectedRows" :url="tableUrl" />
  </div>
</template>

<script>
import ActionsGroup from '@/components/ActionsGroup'
import ImExportDialog from './ImExportDialog'
import { cleanActions } from './utils'

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
    handleExport: {
      type: Function,
      default: function({ selectedRows }) {
        this.$eventBus.$emit('showExportDialog', { selectedRows })
      }
    },
    hasImport: defaultTrue,
    handleImport: {
      type: Function,
      default: function({ selectedRows }) {
        this.$eventBus.$emit('showImportDialog', { selectedRows })
      }
    },
    hasRefresh: defaultTrue,
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
    }
  },
  data() {
    return {
      defaultRightSideActions: [
        { name: 'actionExport', fa: 'fa-download', tip: this.$t('common.Export'), has: this.hasExport, callback: this.handleExport.bind(this) },
        { name: 'actionImport', fa: 'fa-upload', tip: this.$t('common.Import'), has: this.hasImport, callback: this.handleImport.bind(this) },
        { name: 'actionRefresh', fa: 'fa-refresh', tip: this.$t('common.Refresh'), has: this.hasRefresh, callback: this.handleRefresh }
      ],
      dialogExportVisible: false,
      exportValue: 2
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
    }
  },
  methods: {
    handleTagSearch(val) {
      this.searchTable(val)
    },
    // handleExport({ selectedRows }) {
    //   this.$eventBus.$emit('showExportDialog', { selectedRows })
    // },
    // handleImport({ selectedRows }) {
    //   this.$eventBus.$emit('showImportDialog', { selectedRows })
    // },
    handleRefresh() {
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
    background-color: rgb(0, 0, 0, 0.05);
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

  .export-item {

  }

</style>
