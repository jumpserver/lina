<template>
  <Dialog
    :before-close="handleBeforeDialogClose"
    :close-on-click-modal="false"
    :title="dialogTitle"
    :visible="visible"
    class="resource-select-dialog"
    max-width="940px"
    top="4vh"
    width="70vw"
    @cancel="handleCancel"
    @confirm="handleConfirm"
    @update:visible="handleVisibleChange"
  >
    <template #header="{ titleId, titleClass }">
      <div class="resource-select-dialog__header-content">
        <div :id="titleId" :class="[titleClass, 'resource-select-dialog__title']">
          {{ dialogTitle }}
        </div>
        <div :aria-label="dialogTitle" class="resource-select-dialog__tabs" role="tablist">
          <button
            :aria-selected="activeTab === 'selected'"
            :class="{ 'is-active': activeTab === 'selected' }"
            :tabindex="activeTab === 'selected' ? 0 : -1"
            class="resource-select-dialog__tab"
            role="tab"
            type="button"
            @click="selectDialogTab('selected')"
            @keydown.right.prevent="selectDialogTab('available')"
          >
            <span>{{
              $t('ResourceSelectSelectedResources', {
                resource: displayResourceName
              })
            }}</span>
            <span class="resource-select-dialog__tab-count">({{ selectedCount }})</span>
          </button>
          <button
            :aria-selected="activeTab === 'available'"
            :class="{ 'is-active': activeTab === 'available' }"
            :tabindex="activeTab === 'available' ? 0 : -1"
            class="resource-select-dialog__tab"
            role="tab"
            type="button"
            @click="selectDialogTab('available')"
            @keydown.left.prevent="selectDialogTab('selected')"
          >
            <span>{{
              $t('ResourceSelectUnselectedResources', {
                resource: displayResourceName
              })
            }}</span>
            <span v-if="availableCount !== null" class="resource-select-dialog__tab-count">
              ({{ availableCount }})
            </span>
          </button>
        </div>
      </div>
    </template>

    <div class="resource-select-dialog__content">
      <div v-show="activeTab === 'available'" class="resource-select-dialog__panel">
        <ListTable
          ref="availableTable"
          :header-actions="availableHeaderActions"
          :table-config="availableTableConfig"
          :table-metadata-provider="getSharedTableMetadata"
          @selection-change="handleAvailableSelectionChange"
        />
      </div>

      <div v-show="activeTab === 'selected'" class="resource-select-dialog__panel">
        <ListTable
          ref="selectedTable"
          :header-actions="selectedHeaderActions"
          :table-config="selectedTableConfig"
          :table-metadata-provider="getSharedTableMetadata"
          @selection-change="handleSelectedSelectionChange"
        />
      </div>
    </div>
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
    selectedResources: {
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
      default: 10
    }
  },
  emits: ['cancel', 'confirm', 'update:visible'],
  data() {
    const resourceCache = new Map()
    this.selectedResources.forEach((item) => {
      const id = item?.[this.valueKey] ?? item?.value ?? item?.id
      const name = String(item?.name || '').trim()
      if (id !== undefined && id !== null && id !== '' && name) {
        resourceCache.set(String(id), { value: id, name })
      }
    })
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
      resourceCache,
      tableMetadataRequestUrl: '',
      tableMetadataRequest: null,
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
        labelSearchConfig: {
          boundarySelector: '.resource-select-dialog.el-dialog'
        },
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
            type: 'primary',
            can: () => this.availableChecked.length > 0,
            callback: () => this.addResources(this.availableChecked)
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
            type: 'danger',
            can: () => this.selectedChecked.length > 0,
            callback: () => this.removeResources(this.selectedChecked)
          },
          {
            name: 'resourceSelectMoreActions',
            title: this.$t('MoreActions'),
            dropdown: [
              {
                name: 'clearSelectedResources',
                title: this.$t('ResourceSelectRemoveAll'),
                icon: 'fa-square-minus',
                can: () => this.selectedCount > 0,
                callback: () => this.clearSelected()
              }
            ]
          }
        ]
      }
    },
    displayResourceName() {
      return this.resourceName || ''
    },
    dialogTitle() {
      return this.$t('ResourceSelectDialogTitle', { resource: this.displayResourceName })
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
    tableUrl() {
      const url = new URL(this.url, location.origin)
      url.searchParams.set('fields_size', 'small')
      return `${url.pathname}${url.search}${url.hash}`
    },
    defaultColumns() {
      let columns
      if (Array.isArray(this.columnsShow.default)) {
        columns = this.columnsShow.default
      } else {
        const urlPathname = new URL(this.url, location.origin).pathname
        const pathname = urlPathname.endsWith('/') ? urlPathname : `${urlPathname}/`
        columns = defaultColumnsByResource[pathname] || genericDefaultColumns
      }
      const filteredColumns = columns.filter((column) => {
        const name = typeof column === 'object' ? column?.prop : column
        return name !== 'id' && name !== 'actions'
      })
      return [...(filteredColumns.length > 0 ? filteredColumns : ['name']), 'actions']
    },
    minimumColumns() {
      const configured = Array.isArray(this.columnsShow.min) ? this.columnsShow.min : []
      return [...new Set(['name', 'actions', ...configured])].filter((column) => column !== 'id')
    },
    tableName() {
      const pathname = new URL(this.url, location.origin).pathname.replaceAll('/', '_')
      const tableColumns = this.columns.length > 0 ? this.columns : this.defaultColumns
      const columnsKey = tableColumns.length > 0 ? `_${tableColumns.join('_')}` : ''
      return `ResourceSelect${pathname}${columnsKey}`
    },
    commonTableConfig() {
      return {
        url: this.tableUrl,
        id: this.valueKey,
        paginationSize: this.effectivePageSize,
        paginationSizes: [...new Set([10, 15, this.effectivePageSize, 30, 50, 100])]
          .filter((size) => size <= 100)
          .sort((a, b) => a - b),
        persistSelection: false,
        saveQuery: false,
        tableAttrs: {
          size: 'small'
        },
        actionsColumnPosition: 'start',
        selectionFixed: 'left',
        selectionWidth: 40,
        columnsShow: {
          ...this.columnsShow,
          min: this.minimumColumns,
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
        columnsMeta: {
          ...this.commonTableConfig.columnsMeta,
          actions: {
            className: 'resource-select-action-column',
            fitWidth: false,
            fixed: 'left',
            hideHeaderLabel: true,
            width: '60px',
            formatterArgs: {
              compact: true,
              squareButtons: true,
              hasUpdate: false,
              hasDelete: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'add',
                  title: this.$t('Add'),
                  icon: 'fa-solid fa-plus',
                  showTip: false,
                  can: ({ row }) => this.canSelect(row),
                  callback: ({ row }) => this.addResources([row])
                }
              ]
            }
          }
        },
        request: this.requestAvailablePage
      }
    },
    selectedTableConfig() {
      return {
        ...this.commonTableConfig,
        name: `${this.tableName}Resources`,
        columnsMeta: {
          ...this.commonTableConfig.columnsMeta,
          actions: {
            className: 'resource-select-action-column',
            fitWidth: false,
            fixed: 'left',
            hideHeaderLabel: true,
            width: '60px',
            formatterArgs: {
              compact: true,
              squareButtons: true,
              hasUpdate: false,
              hasDelete: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'remove',
                  title: this.$t('Remove'),
                  icon: 'fa-solid fa-minus',
                  iconStyle: { transform: 'scaleX(0.78) scaleY(1.25)' },
                  showTip: false,
                  hoverType: 'danger',
                  callback: ({ row }) => this.removeResources([row])
                }
              ]
            }
          }
        },
        request: this.requestSelectedPage
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
        const dataDirty = value === 'selected' ? this.selectedDirty : this.availableDirty
        if (dataDirty) {
          this.$refs[tableRef]?.reloadTable()
        } else if (pageSizeSynced && !columnsSynced) {
          this.$refs[tableRef]?.dataTable?.dataTable?.getList()
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
    cacheResources(resources) {
      resources.forEach((item) => {
        const id = item?.[this.valueKey] ?? item?.value ?? item?.id
        const name = String(item?.name || '').trim()
        if (id !== undefined && id !== null && id !== '' && name) {
          this.resourceCache.set(String(id), { value: id, name })
        }
      })
    },
    getSelectedResources() {
      return this.draftValue.map((id) => this.resourceCache.get(String(id))).filter(Boolean)
    },
    getSharedTableMetadata(url) {
      if (this.tableMetadataRequest && this.tableMetadataRequestUrl === url) {
        return this.tableMetadataRequest
      }

      this.tableMetadataRequestUrl = url
      const request = this.$store.dispatch('common/getUrlMeta', { url })
      const sharedRequest = request.catch((error) => {
        if (this.tableMetadataRequest === sharedRequest) {
          this.tableMetadataRequest = null
          this.tableMetadataRequestUrl = ''
        }
        throw error
      })
      this.tableMetadataRequest = sharedRequest
      return sharedRequest
    },
    handleAvailableSelectionChange(rows) {
      this.availableChecked = rows
    },
    handleSelectedSelectionChange(rows) {
      this.selectedChecked = rows
    },
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
    async selectDialogTab(nextTab) {
      const currentTab = this.activeTab
      if (nextTab === currentTab) {
        return
      }
      const canLeave = await this.handleBeforeTabLeave(nextTab, currentTab)
      if (canLeave !== false) {
        this.activeTab = nextTab
      }
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
      const normalizedParams = { ...(params || {}) }
      delete normalizedParams.fields_size
      return normalizedParams
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
      const request = this.parseTableRequest(this.tableUrl, table.axiosConfig)
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
          ...selectionParams,
          fields_size: 'small'
        }
      })
      const data = this.normalizeResponse(response)
      this.cacheResources(data.results)
      return data
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
      this.cacheResources(rows)
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
      const selectedIds = this.selectedIdSet
      const removedIds = new Set(
        rows.map((row) => row[this.valueKey]).filter((id) => selectedIds.has(id))
      )
      if (removedIds.size === 0) {
        return
      }
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
      const pendingAdditions = this.availableChecked.filter(
        (row) => this.canSelect(row) && !this.selectedIdSet.has(row[this.valueKey])
      )
      const pendingRemovals = this.selectedChecked.filter((row) =>
        this.selectedIdSet.has(row[this.valueKey])
      )

      if (pendingAdditions.length > 0 || pendingRemovals.length > 0) {
        let message
        if (pendingAdditions.length > 0 && pendingRemovals.length > 0) {
          message = this.$t('ResourceSelectPendingChangesConfirm', {
            addCount: pendingAdditions.length,
            removeCount: pendingRemovals.length
          })
        } else if (pendingAdditions.length > 0) {
          message = this.$t('ResourceSelectPendingAddConfirm', {
            count: pendingAdditions.length
          })
        } else {
          message = this.$t('ResourceSelectPendingRemoveConfirm', {
            count: pendingRemovals.length
          })
        }

        try {
          await this.$confirm(message, this.$t('Confirm'), {
            type: 'warning',
            confirmButtonText: this.$t('Confirm'),
            cancelButtonText: this.$t('Cancel')
          })
        } catch (_) {
          return
        }

        this.addResources(pendingAdditions)
        this.removeResources(pendingRemovals)
      }

      this.$emit('confirm', [...this.draftValue], this.getSelectedResources())
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
  height: min(680px, 94vh);
  display: flex;
  flex-direction: column;

  .el-dialog__header {
    padding: 8px 24px !important;
  }

  .el-dialog__body {
    flex: 1 1 auto;
    min-height: 0;
    padding: 8px 24px 0 !important;
    overflow: auto;
  }

  .el-dialog__footer {
    padding: 4px 24px 6px !important;
  }

  .el-dialog__body > .el-loading-parent--relative {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }

  .resource-select-dialog__header-content {
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 8px;
  }

  .resource-select-dialog__title {
    color: var(--color-text-primary);
    font-size: 18px;
    font-weight: 400;
    line-height: 24px;
  }

  .resource-select-dialog__tabs {
    display: flex;
    align-items: center;
    max-width: calc(100% - 40px);
    height: 30px;
    gap: 24px;
  }

  .resource-select-dialog__tab {
    display: inline-flex;
    align-items: center;
    height: 28px;
    padding: 0;
    border: 0;
    outline: none;
    background: transparent;
    color: var(--el-text-color-regular);
    cursor: pointer;
    font: inherit;
    font-size: 13px;
    font-weight: 400;
    line-height: 24px;
    white-space: nowrap;
    gap: 4px;
    transition: color var(--el-transition-duration-fast);

    &:hover:not(.is-active) {
      color: var(--el-color-primary);
    }

    &:focus-visible {
      box-shadow: inset 0 0 0 2px var(--el-color-primary-light-5);
    }

    &.is-active {
      color: var(--el-color-primary);
      font-weight: 500;
    }

    &.is-active .resource-select-dialog__tab-count {
      color: var(--el-color-primary);
    }
  }

  .resource-select-dialog__tab-count {
    color: var(--el-text-color-placeholder);
    font-size: 12px;
  }

  .resource-select-dialog__content,
  .resource-select-dialog__panel {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    height: 100%;
    min-width: 0;
    min-height: 0;
  }

  .list-table {
    flex: 1 1 auto;
    height: 100%;
    min-height: 0;
    gap: 4px;
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
    padding: 6px 12px 8px;
  }

  .el-dialog__body .table-action .table-action__toolbar .search {
    gap: 8px;

    &.has-label-filter .search-primary {
      margin-left: 0;
    }
  }

  .resource-select-action-column {
    border-right-color: transparent !important;
  }
}
</style>
