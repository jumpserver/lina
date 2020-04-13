<template>
  <div class="table-header">
    <slot name="header">
      <div v-if="hasLeftActions" class="table-header-left-side">
        <ActionsGroup :actions="actions" :more-actions="moreActions" class="header-action" @actionClick="handleActionClick" />
      </div>
      <div class="table-action-right-side">
        <el-input v-if="hasSearch" v-model="keyword" suffix-icon="el-icon-search" :placeholder="$tc('Search')" class="right-side-item action-search" size="small" clearable @change="handleSearch" @input="handleSearch" />
        <ActionsGroup :is-fa="true" :actions="defaultRightSideActions" class="right-side-actions right-side-item" @actionClick="handleActionClick" />
      </div>
    </slot>
  </div>
</template>

<script>
import ActionsGroup from '@/components/ActionsGroup'
import _ from 'lodash'
import { createSourceIdCache } from '@/api/common'

const defaultTrue = { type: Boolean, default: true }
const defaultFalse = { type: Boolean, default: false }

export default {
  name: 'TableAction',
  components: {
    ActionsGroup
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
    tableUrl: {
      type: String,
      default: ''
    },
    createRoute: {
      type: String,
      default: () => {
        return this.$route.name.replace('List', 'Create')
      }
    },
    reloadTable: {
      type: Function,
      default: () => {}
    },
    performBulkDelete: {
      type: Function,
      default: () => {}
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
      defaultActions: [
        {
          name: 'actionCreate',
          title: this.$tc('Create'),
          type: 'primary',
          has: this.hasCreate,
          can: true,
          callback: this.handleCreate
        }
      ],
      defaultMoreActions: [
        {
          title: this.$tc('Delete selected'),
          name: 'actionDeleteSelected',
          can: (rows) => rows.length > 0,
          has: this.hasBulkDelete,
          callback: this.defaultBulkDeleteCallback
        },
        {
          title: this.$tc('Update selected'),
          name: 'actionUpdateSelected',
          can: (rows) => rows.length > 0,
          has: this.hasBulkUpdate,
          callback: this.handleBulkUpdate
        }
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
      return this.cleanActions(actions)
    },

    namedActions() {
      const totalActions = [...this.actions, ...this.moreActions, ...this.rightSideActions]
      const actions = {}
      for (const action of totalActions) {
        if (!action || !action.hasOwnProperty('name')) {
          continue
        }
        actions[action.name] = action
      }
      return actions
    }
  },
  methods: {
    handleSearch: _.debounce(function() {
      this.searchTable({ search: this.keyword })
    }, 500),
    handleActionClick(item) {
      console.log('name cations')
      let handler = this.namedActions[item] ? this.namedActions[item].callback : null
      if (!handler) {
        handler = () => {
          console.log('No handler found for ', item)
        }
      }
      handler(this.selectedRows)
    },
    handleCreate() {
      const routeName = this.createRoute
      this.$router.push({ name: routeName })
      console.log('handle create')
    },
    defaultBulkDeleteCallback(rows) {
      const msg = this.$tc('Are you sure to delete') + ' ' + rows.length + ' ' + this.$tc('rows')
      const title = this.$tc('Info')
      const performDelete = this.performBulkDelete || this.defaultPerformBulkDelete
      this.$alert(msg, title, {
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        showCancelButton: true,
        beforeClose: async(action, instance, done) => {
          if (action !== 'confirm') return done()
          instance.confirmButtonLoading = true
          try {
            await performDelete(rows)
            done()
            this.reloadTable()
            this.$message.success(this.$tc('Delete success'))
          } catch (error) {
            this.$message.error(this.$tc('Delete failed'))
            console.warn(error)
          } finally {
            instance.confirmButtonLoading = false
          }
        }
      }).catch(() => {
        /* 取消*/
      })
    },
    async defaultPerformBulkDelete(rows) {
      const ids = rows.map((v) => {
        return v.id
      })
      const data = await createSourceIdCache(ids)
      const url = `${this.tableUrl}?spm=` + data.spm
      return this.$axios.delete(url)
    },
    handleBulkUpdate(rows) {
    },
    handleExport(row) {
      console.log(row)
      this.$eventBus.$emit('showExportDialog', row)
    },
    handleImport(row) {
      console.log(row)
      this.$eventBus.$emit('showImportDialog', row)
    },
    handleRefresh() {
      this.reloadTable()
    },
    cleanActions(actions) {
      const validActions = []
      for (const action of actions) {
        let ok = this.checkItem(action, 'has')
        if (!ok) {
          continue
        }
        ok = this.checkItem(action, 'can')
        action.disabled = !ok
        validActions.push(action)
      }
      return validActions
    },
    checkItem(item, attr) {
      let ok = item[attr]
      if (typeof ok === 'function') {
        ok = ok(this.selectedRows)
      } else if (ok == null) {
        ok = true
      }
      return ok
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
