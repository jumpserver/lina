<template>
  <Dialog
    :before-close="handleBeforeDialogClose"
    :close-on-click-modal="false"
    :title="$t('ResourceSelectDialogTitle', { resource: displayResourceName })"
    :visible="visible"
    class="resource-select-dialog"
    max-width="1200px"
    top="3vh"
    width="88vw"
    @cancel="handleCancel"
    @confirm="handleConfirm"
    @update:visible="handleVisibleChange"
  >
    <el-tabs
      v-model="activeTab"
      :before-leave="handleBeforeTabLeave"
      class="resource-select-dialog__tabs"
    >
      <el-tab-pane name="available">
        <template #label>
          {{ $t('ResourceSelectUnselectedResources') }}
          <span v-if="availableCount !== null">({{ availableCount }})</span>
        </template>
        <ListTable
          ref="availableTable"
          :header-actions="availableHeaderActions"
          :table-config="availableTableConfig"
          @selection-change="availableChecked = $event"
        />
      </el-tab-pane>

      <el-tab-pane name="selected">
        <template #label>
          {{ $t('ResourceSelectSelectedResources') }} ({{ selectedCount }})
        </template>
        <ListTable
          ref="selectedTable"
          :header-actions="selectedHeaderActions"
          :table-config="selectedTableConfig"
          @selection-change="selectedChecked = $event"
        />
      </el-tab-pane>
    </el-tabs>
  </Dialog>
</template>

<script>
import { createSourceIdCache } from '@/api/common'
import Dialog from '@/components/Dialog/index.vue'
import ListTable from '@/components/Table/ListTable/index.vue'

const defaultColumnsByResource = {
  '/api/v1/accounts/accounts/': ['name', 'username', 'asset', 'secret_type', 'actions'],
  '/api/v1/assets/assets/': ['name', 'address', 'platform', 'category', 'type', 'zone', 'actions'],
  '/api/v1/labels/labels/': ['name', 'value', 'color', 'actions'],
  '/api/v1/users/groups/': ['name', 'users_amount', 'comment', 'actions'],
  '/api/v1/users/users/': ['name', 'username', 'email', 'source', 'is_active', 'actions']
}

const genericDefaultColumns = ['name', 'value', 'address', 'username', 'actions']

export default {
  name: 'ResourceSelectDialog',
  components: { Dialog, ListTable },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    value: {
      type: Array,
      default: () => []
    },
    initialTab: {
      type: String,
      default: 'available'
    },
    url: {
      type: String,
      required: true
    },
    resourceName: {
      type: String,
      default: ''
    },
    valueKey: {
      type: String,
      default: 'id'
    },
    queryParams: {
      type: [Object, Function],
      default: () => ({})
    },
    nodeFilter: {
      type: [Boolean, Object],
      default: false
    },
    canSelect: {
      type: Function,
      default: () => true
    },
    columnsMeta: {
      type: Object,
      default: () => ({})
    },
    columns: {
      type: Array,
      default: () => []
    },
    columnsShow: {
      type: Object,
      default: () => ({})
    },
    pageSize: {
      type: Number,
      default: 15
    }
  },
  emits: ['cancel', 'confirm', 'update:visible'],
  data() {
    return {
      activeTab: this.initialTab,
      draftValue: [...this.value],
      availableCount: null,
      availableChecked: [],
      selectedChecked: [],
      sharedPageSize: Math.min(Math.max(this.pageSize, 1), 100),
      availableDirty: false,
      selectedDirty: false,
      nodePopoversPreparedForClose: false,
      selectionVersion: 0,
      selectionSpm: null,
      selectionSpmVersion: -1,
      selectionSpmPromise: null,
      selectionSpmPromiseVersion: -1,
      availableRequestQueue: Promise.resolve(),
      selectedRequestQueue: Promise.resolve(),
      sharedNodeTreeState: {
        asset: {
          data: [],
          defaultExpandedKeys: [],
          loaded: false,
          loading: false
        },
        type: {
          data: [],
          defaultExpandedKeys: [],
          loaded: false,
          loading: false
        }
      }
    }
  },
  computed: {
    baseHeaderActions() {
      return {
        hasLeftActions: true,
        hasCreate: false,
        hasBulkDelete: false,
        hasBulkUpdate: false,
        hasMoreActions: false,
        hasRightActions: true,
        hasColumnSetting: true,
        hasImport: false,
        hasExport: false,
        hasRefresh: false,
        hasLabelSearch: true,
        hasNodeSearch: Boolean(this.nodeFilter),
        nodeSearchConfig: {
          ...(typeof this.nodeFilter === 'object' ? this.nodeFilter : {}),
          sharedTreeState: this.sharedNodeTreeState
        },
        searchConfig: {
          getUrlQuery: false
        }
      }
    },
    availableHeaderActions() {
      return {
        ...this.baseHeaderActions,
        extraActions: [
          {
            name: 'addSelectedResources',
            title: this.$t('ResourceSelectAddSelected', {
              count: this.availableChecked.length
            }),
            icon: 'plus',
            type: 'primary',
            can: ({ selectedRows }) => selectedRows.length > 0,
            callback: ({ selectedRows }) => this.addResources(selectedRows)
          }
        ]
      }
    },
    selectedHeaderActions() {
      return {
        ...this.baseHeaderActions,
        extraActions: [
          {
            name: 'removeSelectedResources',
            title: this.$t('ResourceSelectRemoveSelected', {
              count: this.selectedChecked.length
            }),
            icon: 'fa-minus-square-o',
            type: 'danger',
            can: ({ selectedRows }) => selectedRows.length > 0,
            callback: ({ selectedRows }) => this.removeResources(selectedRows)
          },
          {
            name: 'clearSelectedResources',
            title: this.$t('ResourceSelectRemoveAll'),
            icon: 'trash',
            can: () => this.selectedCount > 0,
            callback: () => this.clearSelected()
          }
        ]
      }
    },
    displayResourceName() {
      return this.resourceName || this.$t('Resources')
    },
    selectedCount() {
      return this.draftValue.length
    },
    selectedIdSet() {
      return new Set(this.draftValue)
    },
    effectivePageSize() {
      return Math.min(Math.max(this.pageSize, 1), 100)
    },
    defaultColumns() {
      if (Array.isArray(this.columnsShow.default)) {
        return this.columnsShow.default
      }
      const urlPathname = new URL(this.url, location.origin).pathname
      const pathname = urlPathname.endsWith('/') ? urlPathname : `${urlPathname}/`
      return defaultColumnsByResource[pathname] || genericDefaultColumns
    },
    tableName() {
      const pathname = new URL(this.url, location.origin).pathname.replaceAll('/', '_')
      const tableColumns = this.columns.length > 0 ? this.columns : this.defaultColumns
      const columnsKey = tableColumns.length > 0 ? `_${tableColumns.join('_')}` : ''
      return `ResourceSelect${pathname}${columnsKey}`
    },
    commonTableConfig() {
      return {
        url: this.url,
        id: this.valueKey,
        ...(this.columns.length > 0 ? { columns: this.columns } : {}),
        paginationSize: this.effectivePageSize,
        paginationSizes: [...new Set([this.effectivePageSize, 30, 50, 100])]
          .filter((size) => size <= 100)
          .sort((a, b) => a - b),
        persistSelection: false,
        saveQuery: false,
        columnsShow: {
          min: ['name', 'actions'],
          ...this.columnsShow,
          default: this.defaultColumns
        },
        columnsMeta: {
          name: {
            formatterArgs: {
              can: false
            }
          },
          ...this.columnsMeta
        }
      }
    },
    availableTableConfig() {
      return {
        ...this.commonTableConfig,
        name: `${this.tableName}Resources`,
        canSelect: this.canSelect,
        request: this.requestAvailablePage,
        columnsMeta: {
          ...this.commonTableConfig.columnsMeta,
          actions: {
            formatterArgs: {
              hasUpdate: false,
              hasDelete: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'add',
                  title: this.$t('Add'),
                  icon: 'fa-plus',
                  can: ({ row }) => this.canSelect(row),
                  callback: ({ row }) => this.addResources([row])
                }
              ]
            }
          }
        }
      }
    },
    selectedTableConfig() {
      return {
        ...this.commonTableConfig,
        name: `${this.tableName}Resources`,
        request: this.requestSelectedPage,
        columnsMeta: {
          ...this.commonTableConfig.columnsMeta,
          actions: {
            formatterArgs: {
              hasUpdate: false,
              hasDelete: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'remove',
                  title: this.$t('Remove'),
                  type: 'danger',
                  callback: ({ row }) => this.removeResources([row])
                }
              ]
            }
          }
        }
      }
    }
  },
  watch: {
    activeTab(value, previousValue) {
      const previousRef = previousValue === 'selected' ? 'selectedTable' : 'availableTable'
      const previousTable = this.$refs[previousRef]?.dataTable?.dataTable
      if (previousTable?.size) {
        this.sharedPageSize = previousTable.size
      }
      this.$nextTick(() => {
        const tableRef = value === 'selected' ? 'selectedTable' : 'availableTable'
        const pageSizeSynced = this.syncTablePageSize(tableRef)
        const columnsSynced = this.syncTableColumns(tableRef)
        if (pageSizeSynced && !columnsSynced) {
          this.$refs[tableRef]?.dataTable?.dataTable?.getList()
        }
        const tableSynced = pageSizeSynced || columnsSynced
        if (value === 'selected' && this.selectedDirty && !tableSynced) {
          this.$refs.selectedTable?.reloadTable()
          this.selectedDirty = false
        }
        if (value === 'available' && this.availableDirty && !tableSynced) {
          this.$refs.availableTable?.reloadTable()
          this.availableDirty = false
        }
        if (value === 'selected') {
          this.selectedDirty = false
        } else {
          this.availableDirty = false
        }
      })
    }
  },
  mounted() {
    document.addEventListener('keydown', this.handleDialogShortcut)
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleDialogShortcut)
  },
  methods: {
    handleDialogShortcut(event) {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.repeat ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      ) {
        return
      }
      const target = event.target
      if (
        event.key !== '/' ||
        target?.closest?.('input, textarea, select, [contenteditable="true"]')
      ) {
        return
      }

      const tableRef = this.activeTab === 'selected' ? 'selectedTable' : 'availableTable'
      const table = this.$refs[tableRef]
      if (!table) {
        return
      }
      event.preventDefault()
      table.focusSearch()
    },
    async closeNodeSearchPopovers() {
      await Promise.all([
        this.$refs.availableTable?.closeNodeSearch(),
        this.$refs.selectedTable?.closeNodeSearch()
      ])
    },
    async handleBeforeDialogClose(done) {
      await this.closeNodeSearchPopovers()
      this.nodePopoversPreparedForClose = true
      done()
    },
    async handleBeforeTabLeave(nextTab, currentTab) {
      if (nextTab === currentTab) {
        return true
      }
      const currentTable = currentTab === 'selected' ? 'selectedTable' : 'availableTable'
      await this.$refs[currentTable]?.closeNodeSearch()
      return true
    },
    syncTablePageSize(refName) {
      const table = this.$refs[refName]?.dataTable?.dataTable
      if (!table || table.size === this.sharedPageSize) {
        return false
      }
      table.size = this.sharedPageSize
      table.page = table.firstPage
      return true
    },
    syncTableColumns(refName) {
      const autoTable = this.$refs[refName]?.$refs?.dataTable
      if (!autoTable?.tableColumnsStorage) {
        return false
      }
      const storedColumns = autoTable.tableColumnsStorage.get()
      const currentColumns = autoTable.popoverColumns?.currentCols || []
      if (
        !Array.isArray(storedColumns) ||
        JSON.stringify(storedColumns) === JSON.stringify(currentColumns)
      ) {
        return false
      }
      autoTable.cleanColumnsShow()
      autoTable.filterShowColumns()
      autoTable.generatePopoverColumns()
      return true
    },
    getQueryParams() {
      const params = typeof this.queryParams === 'function' ? this.queryParams() : this.queryParams
      return { ...(params || {}) }
    },
    normalizeResponse(response) {
      if (Array.isArray(response)) {
        return { results: response, count: response.length, next: null }
      }
      return {
        results: response?.results || [],
        count: Number(response?.count || 0),
        next: response?.next || null
      }
    },
    parseTableRequest(requestUrl, axiosConfig = {}) {
      const queryIndex = requestUrl.indexOf('?')
      const baseUrl = queryIndex === -1 ? requestUrl : requestUrl.slice(0, queryIndex)
      const queryString = queryIndex === -1 ? '' : requestUrl.slice(queryIndex + 1)
      return {
        baseUrl,
        params: {
          ...(axiosConfig?.params || {}),
          ...Object.fromEntries(new URLSearchParams(queryString))
        }
      }
    },
    createTablePageRequest(table, page = table.page) {
      const request = this.parseTableRequest(this.url, table.axiosConfig)
      const limit = table.size || this.effectivePageSize
      const offset = Math.max((page - table.firstPage) * limit, 0)
      return {
        baseUrl: request.baseUrl,
        params: {
          ...request.params,
          ...(table.getQuery?.() || {}),
          limit,
          offset
        }
      }
    },
    async requestResourcePage(request, selectionParams = {}) {
      const response = await this.$axios.get(request.baseUrl, {
        params: {
          ...this.getQueryParams(),
          ...request.params,
          ...selectionParams
        }
      })
      return this.normalizeResponse(response)
    },
    requestAvailablePage(requestUrl, axiosConfig) {
      const selectionVersion = this.selectionVersion
      const shouldUpdateCount = !this.hasAvailableFilters()
      const task = this.availableRequestQueue.then(() =>
        this.buildAvailablePage(this.parseTableRequest(requestUrl, axiosConfig))
      )
      this.availableRequestQueue = task.catch(() => undefined)
      return task.then((data) => {
        if (shouldUpdateCount && selectionVersion === this.selectionVersion) {
          this.availableCount = data.count
        }
        return { data }
      })
    },
    hasAvailableFilters() {
      const query = this.$refs.availableTable?.getMergedQuery?.() || {}
      return Object.values(query).some((value) => {
        if (Array.isArray(value)) {
          return value.length > 0
        }
        if (value && typeof value === 'object') {
          return Object.keys(value).length > 0
        }
        return value !== '' && value !== undefined && value !== null
      })
    },
    async buildAvailablePage(request) {
      const excludeSpm = await this.getSelectionSpm()
      return this.requestResourcePage(request, {
        exclude_spm: excludeSpm || undefined
      })
    },
    async getSelectionSpm() {
      const version = this.selectionVersion
      if (this.selectionSpmVersion === version) {
        return this.selectionSpm
      }

      if (this.draftValue.length === 0) {
        this.selectionSpm = null
        this.selectionSpmVersion = version
        return null
      }

      if (this.selectionSpmPromise && this.selectionSpmPromiseVersion === version) {
        return this.selectionSpmPromise
      }

      const task = createSourceIdCache([...this.draftValue]).then(({ spm }) => {
        if (version !== this.selectionVersion) {
          return this.getSelectionSpm()
        }
        this.selectionSpm = spm
        this.selectionSpmVersion = version
        return this.selectionSpm
      })
      this.selectionSpmPromise = task
      this.selectionSpmPromiseVersion = version

      try {
        return await task
      } finally {
        if (this.selectionSpmPromise === task) {
          this.selectionSpmPromise = null
          this.selectionSpmPromiseVersion = -1
        }
      }
    },
    async buildSelectedPage(request) {
      if (this.draftValue.length === 0) {
        return { results: [], count: 0 }
      }
      const spm = await this.getSelectionSpm()
      return this.requestResourcePage(request, {
        spm
      })
    },
    async requestSelectedPage(requestUrl, axiosConfig) {
      const data = await this.buildSelectedPage(this.parseTableRequest(requestUrl, axiosConfig))
      return { data }
    },
    invalidateSelectionCache() {
      this.selectionVersion += 1
      this.selectionSpm = null
      this.selectionSpmVersion = -1
      this.selectionSpmPromise = null
      this.selectionSpmPromiseVersion = -1
      this.availableChecked = []
      this.selectedChecked = []
    },
    refillAvailableTable() {
      const table = this.$refs.availableTable?.dataTable?.dataTable
      if (!table) {
        return
      }

      const version = this.selectionVersion
      const task = this.availableRequestQueue.then(() =>
        this.loadTablePage(table, (request) => this.buildAvailablePage(request))
      )
      this.availableRequestQueue = task.catch(() => undefined)
      task
        .then(({ data, page }) => {
          if (version !== this.selectionVersion) {
            return
          }
          table.page = page
          table.data = data.results
          table.total = data.count
          table.clearSelection()
        })
        .catch(() => undefined)
    },
    refillSelectedTable() {
      const table = this.$refs.selectedTable?.dataTable?.dataTable
      if (!table) {
        return
      }

      if (this.selectedCount === 0) {
        table.data = []
        table.total = 0
        table.page = table.firstPage
        table.clearSelection()
        return
      }

      const version = this.selectionVersion
      const task = this.selectedRequestQueue.then(() =>
        this.loadTablePage(table, (request) => this.buildSelectedPage(request))
      )
      this.selectedRequestQueue = task.catch(() => undefined)
      task
        .then(({ data, page }) => {
          if (version !== this.selectionVersion) {
            return
          }
          table.page = page
          table.data = data.results
          table.total = data.count
          table.clearSelection()
        })
        .catch(() => undefined)
    },
    async loadTablePage(table, requestPage) {
      const limit = table.size || this.effectivePageSize
      let page = table.page
      let data = await requestPage(this.createTablePageRequest(table, page))
      const resultLastPage = Math.max(
        Math.ceil(data.count / limit) + table.firstPage - 1,
        table.firstPage
      )
      if (page > resultLastPage) {
        page = resultLastPage
        data = await requestPage(this.createTablePageRequest(table, page))
      }
      return { data, page }
    },
    removeRowsFromTable(refName, ids) {
      const table = this.$refs[refName]?.dataTable?.dataTable
      if (!table) {
        return
      }
      const idSet = new Set(ids)
      const beforeCount = table.data.length
      table.data = table.data.filter((row) => !idSet.has(row[this.valueKey]))
      const removedCount = beforeCount - table.data.length
      table.total = Math.max((table.total || 0) - removedCount, 0)
      table.clearSelection()
    },
    addResources(rows) {
      const addedIds = []
      rows
        .filter((row) => this.canSelect(row))
        .forEach((row) => {
          const id = row[this.valueKey]
          if (!this.selectedIdSet.has(id)) {
            this.draftValue.push(id)
            addedIds.push(id)
          }
        })
      if (addedIds.length === 0) {
        return
      }
      this.invalidateSelectionCache()
      if (this.availableCount !== null) {
        this.availableCount = Math.max(this.availableCount - addedIds.length, 0)
      }
      this.removeRowsFromTable('availableTable', addedIds)
      this.refillAvailableTable()
      this.selectedDirty = true
    },
    removeResources(rows) {
      const removedIds = new Set(rows.map((row) => row[this.valueKey]))
      this.draftValue = this.draftValue.filter((id) => !removedIds.has(id))
      this.invalidateSelectionCache()
      if (this.availableCount !== null) {
        this.availableCount += removedIds.size
      }
      this.removeRowsFromTable('selectedTable', [...removedIds])
      this.refillSelectedTable()
      this.availableDirty = true
    },
    clearSelected() {
      const removedCount = this.selectedCount
      this.draftValue = []
      this.invalidateSelectionCache()
      if (this.availableCount !== null) {
        this.availableCount += removedCount
      }
      const table = this.$refs.selectedTable?.dataTable?.dataTable
      if (table) {
        table.data = []
        table.total = 0
        table.clearSelection()
      }
      this.availableDirty = true
    },
    async handleVisibleChange(value) {
      if (!value) {
        if (!this.nodePopoversPreparedForClose) {
          await this.closeNodeSearchPopovers()
        }
        this.nodePopoversPreparedForClose = false
      }
      this.$emit('update:visible', value)
    },
    async handleConfirm() {
      await this.closeNodeSearchPopovers()
      this.$emit('confirm', [...this.draftValue])
      this.$emit('update:visible', false)
    },
    async handleCancel() {
      await this.closeNodeSearchPopovers()
      this.$emit('cancel')
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss">
.resource-select-dialog.el-dialog {
  height: min(820px, 86vh);
  display: flex;
  flex-direction: column;

  .el-dialog__body {
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
  }

  .el-dialog__body > .el-loading-parent--relative {
    min-height: 100%;
  }
}
</style>
