<template>
  <div class="table-header">
    <slot name="header">
      <div class="table-header-left-side">
        <ActionsGroup v-if="hasLeftActions" :actions="actions" :more-actions="moreActions" :more-actions-title="moreActionsTitle" class="header-action" />
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
import { createSourceIdCache } from '@/api/common'
import _ from 'lodash'

const defaultTrue = { type: Boolean, default: true }
const defaultFalse = { type: Boolean, default: false }

export default {
  name: 'TableAction',
  components: {
    ActionsGroup,
    DialogAction,
    AutoDataSearch
  },
  props: {
    hasExport: defaultTrue,
    hasImport: defaultTrue,
    hasRefresh: defaultTrue,
    hasCreate: defaultTrue,
    hasBulkDelete: defaultTrue,
    hasBulkUpdate: defaultFalse,
    hasLeftActions: defaultTrue,
    hasSearch: defaultTrue,
    hasRightActions: defaultTrue,
    searchConfig: {
      type: Object,
      default: () => ({})
    },
    tableUrl: {
      type: String,
      default: ''
    },
    createRoute: {
      type: String,
      default: function() {
        return this.$route.name.replace('List', 'Create')
      }
    },
    reloadTable: {
      type: Function,
      default: () => {}
    },
    performBulkDelete: {
      type: Function,
      default: null
    },
    searchTable: {
      type: Function,
      default: () => {}
    },
    selectedRows: {
      type: Array,
      default: () => ([])
    },
    extraActions: {
      type: Array,
      default: () => ([])
    },
    extraMoreActions: {
      type: Array,
      default: () => ([])
    },
    extraRightSideActions: {
      type: Array,
      default: () => ([])
    },
    moreActionsTitle: {
      type: String,
      default: null
    },
    testFields: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      keyword: '',
      defaultActions: [
        {
          name: 'actionCreate',
          title: this.$t('common.Create'),
          type: 'primary',
          has: this.hasCreate,
          can: true,
          callback: this.handleCreate
        }
      ],
      defaultMoreActions: [
        {
          title: this.$t('common.deleteSelected'),
          name: 'actionDeleteSelected',
          has: this.hasBulkDelete,
          can({ selectedRows }) {
            console.log('Select rows lenght: ', selectedRows.length)
            return selectedRows.length > 0
          },
          callback: this.defaultBulkDeleteCallback
        },
        {
          title: this.$t('common.updateSelected'),
          name: 'actionUpdateSelected',
          has: this.hasBulkUpdate,
          can: ({ selectedRows }) => selectedRows.length > 0,
          callback: this.handleBulkUpdate
        }
      ],
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
      return this.cleanActions(actions)
    },
    actions() {
      const actions = [...this.defaultActions, ...this.extraActions]
      return this.cleanActions(actions)
    },
    moreActions() {
      const actions = [...this.defaultMoreActions, ...this.extraMoreActions]
      return this.cleanActions(actions, true)
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
    handleCreate() {
      const routeName = this.createRoute
      this.$router.push({ name: routeName })
      this.$log.debug('handle create')
    },
    defaultBulkDeleteCallback({ selectedRows, reloadTable }) {
      const msg = this.$t('common.deleteWarningMsg') + ' ' + selectedRows.length + ' ' + this.$t('common.rows') + ' ?'
      const title = this.$t('common.Info')
      const performDelete = this.performBulkDelete || this.defaultPerformBulkDelete
      this.$alert(msg, title, {
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        showCancelButton: true,
        beforeClose: async(action, instance, done) => {
          if (action !== 'confirm') return done()
          instance.confirmButtonLoading = true
          try {
            await performDelete(selectedRows)
            done()
            reloadTable()
            this.$message.success(this.$t('common.bulkDeleteSuccessMsg'))
          } catch (error) {
            this.$message.error(this.$t('common.bulkDeleteErrorMsg'))
          } finally {
            instance.confirmButtonLoading = false
          }
        }
      }).catch(() => {
        /* 取消*/
      })
    },
    async defaultPerformBulkDelete({ selectedRows }) {
      const ids = selectedRows.map((v) => {
        return v.id
      })
      const data = await createSourceIdCache(ids)
      const url = `${this.tableUrl}?spm=` + data.spm
      return this.$axios.delete(url)
    },
    handleBulkUpdate({ selectedRows }) {
    },
    handleExport({ selectedRows }) {
      this.$eventBus.$emit('showExportDialog', { selectedRows })
    },
    handleImport({ selectedRows }) {
      this.$eventBus.$emit('showImportDialog', { selectedRows })
    },
    handleRefresh() {
      this.reloadTable()
    },
    cleanActions(actions, canDefaults) {
      // this.$log.debug('Start clean actions: ', canDefaults)
      actions = actions.map((action) => {
        action.has = this.cleanBoolean(action, 'has')
        action.can = this.cleanBoolean(action, 'can', canDefaults)
        action.callback = this.cleanCallback(action)
        return action
      })
      return actions
    },
    cleanBoolean(action, attr, defaults) {
      // this.$log.debug('Clean boolean', action, attr)
      let v = action[attr]

      if (defaults === undefined) {
        defaults = true
      }
      if (v === undefined) {
        // console.log('Defaults is: ', attr, defaults)
        v = defaults
      }

      if (typeof v === 'function') {
        return () => v({
          selectedRows: this.selectedRows,
          reloadTable: this.reloadTable
        })
      } else {
        return v
      }
    },
    cleanCallback(action) {
      const v = action.callback
      if (!v && typeof callback !== 'function') {
        return null
      }
      return () => v({
        selectedRows: this.selectedRows,
        reloadTable: this.reloadTable
      })
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
