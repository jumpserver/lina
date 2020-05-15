<template>
  <div class="table-header">
    <slot name="header">
      <div class="table-header-left-side">
        <LeftSide v-if="hasLeftActions" :selected-rows="selectedRows" v-bind="$attrs" v-on="$listeners" />
        <span v-else>
          <AutoDataSearch v-if="hasSearch" class="right-side-item action-search" :config="searchConfig" :url="tableUrl" @tagSearch="handleTagSearch" />
        </span>
      </div>
      <div class="table-action-right-side">
        <AutoDataSearch v-if="hasLeftActions && hasSearch" class="right-side-item action-search" :config="searchConfig" :url="tableUrl" @tagSearch="handleTagSearch" />
        <ActionsGroup :is-fa="true" :actions="rightSideActions" class="right-side-actions right-side-item" />
        <DialogAction :selected-rows="selectedRows" :url="tableUrl" />
      </div>
    </slot>
  </div>
</template>

<script>
import AutoDataSearch from '@/components/AutoDataSearch'
import DialogAction from '@/components/DialogAction'
import ActionsGroup from '@/components/ActionsGroup'
import LeftSide from './LeftSide'
import { cleanActions } from './utils'
import _ from 'lodash'

const defaultTrue = { type: Boolean, default: true }
const defaultFalse = { type: Boolean, default: false }

export default {
  name: 'TableAction',
  components: {
    ActionsGroup,
    DialogAction,
    AutoDataSearch,
    LeftSide
  },
  props: {
    hasExport: defaultTrue,
    hasImport: defaultTrue,
    hasRefresh: defaultTrue,
    hasLeftActions: defaultTrue,
    hasSearch: defaultTrue,
    hasRightActions: defaultFalse,
    searchConfig: {
      type: Object,
      default: () => ({})
    },
    tableUrl: {
      type: String,
      default: ''
    },
    searchTable: {
      type: Function,
      default: () => {}
    },
    selectedRows: {
      type: Array,
      default: () => []
    },
    testFields: {
      type: Array,
      default() {
        return []
      }
    },
    extraRightSideActions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      keyword: '',
      defaultRightSideActions: [
        { name: 'actionExport', fa: 'fa-download', has: this.hasExport, callback: this.handleExport },
        { name: 'actionImport', fa: 'fa-upload', has: this.hasImport, callback: this.handleImport },
        { name: 'actionRefresh', fa: 'fa-refresh', has: this.hasRefresh, callback: this.handleRefresh }
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
    handleSearch: _.debounce(function() {
      this.searchTable({ search: this.keyword })
    }, 500),
    handleTagSearch(val) {
      this.searchTable(val)
    },
    handleExport({ selectedRows }) {
      this.$eventBus.$emit('showExportDialog', { selectedRows })
    },
    handleImport({ selectedRows }) {
      this.$eventBus.$emit('showImportDialog', { selectedRows })
    },
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
    display: block;
    padding: 5px 20px;
  }

</style>
