<template>
  <div class="auto-data-table" @wheel="handleCellWheel">
    <div v-loading="loading">
      <DataTable
        v-bind="$attrs"
        v-if="!loading"
        ref="dataTable"
        :config="iConfig"
        @column-pin-toggle="toggleColumnPin"
        @filter-change="filterChange"
        @loaded="handleLoaded"
      />
    </div>
    <ColumnSettingPopover
      ref="columnSettingPopover"
      :current-columns="popoverColumns.currentCols"
      :default-columns="popoverColumns.defaultCols"
      :min-columns="popoverColumns.minCols"
      :total-columns-list="popoverColumns.totalColumnsList"
      :url="config.url"
      @columns-update="handlePopoverColumnsChange"
    />
  </div>
</template>

<script>
import { getActionMeta, getFilterMeta, getOrderingMeta } from '@/api/common'
import DataTable from '@/components/Table/DataTable/index.vue'
import { newURL, replaceAllUUID } from '@/utils/common/index'
import { ObjectLocalStorage } from '@/utils/common/objectLocalStorage'
import Sortable from 'sortablejs'
import ColumnSettingPopover from './components/ColumnSettingPopover.vue'
import { orderActionColumn, orderPrimaryColumns, TableColumnsGenerator } from './utils'
import _ from 'lodash'

const CELL_WHEEL_GESTURE_GAP = 120
const CELL_WHEEL_ACCELERATION_RATIO = 1.35
const CELL_WHEEL_ACCELERATION_EPSILON = 0.5
const COLUMN_WIDTH_CHANGE_TOLERANCE = 1
const TABLE_CELL_SELECTOR = '.el-table__body td.el-table__cell .cell'
const DEFAULT_HIDDEN_COLUMN_NAMES = new Set(['id'])

function isDefaultHiddenColumn(column) {
  const name = typeof column === 'object' ? column?.prop : column
  return DEFAULT_HIDDEN_COLUMN_NAMES.has(name)
}

function getWheelEventTarget(event) {
  return event.target instanceof Element ? event.target : event.target?.parentElement
}

function getHorizontalWheelDelta(event, hasActiveGesture, pageWidth) {
  let delta = 0
  if (event.shiftKey) {
    delta = event.deltaX || event.deltaY
  } else if (hasActiveGesture && event.deltaX) {
    delta = event.deltaX
  } else if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
    delta = event.deltaX
  }

  if (!delta) {
    return 0
  }

  const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? pageWidth || 1 : 1
  return delta * scale
}

function findCellScrollTarget(root, target) {
  const cell = target?.closest(TABLE_CELL_SELECTOR)
  if (!cell || !root.contains(cell)) {
    return null
  }

  const scrollContainer = [target.closest('.label-wrapper'), cell].find(
    (element) => element && element.scrollWidth > element.clientWidth + 1
  )
  return scrollContainer ? { cell, scrollContainer } : null
}

function shouldRestartCellWheelGesture(gesture, target, delta, now) {
  if (target && gesture.cell.contains(target)) {
    return false
  }

  const directionChanged = Math.sign(delta) !== Math.sign(gesture.lastDelta)
  const accelerated =
    Math.abs(delta) >
    Math.abs(gesture.lastDelta) * CELL_WHEEL_ACCELERATION_RATIO + CELL_WHEEL_ACCELERATION_EPSILON
  return now - gesture.lastTime > CELL_WHEEL_GESTURE_GAP || directionChanged || accelerated
}

export default {
  name: 'AutoDataTable',
  components: {
    DataTable,
    ColumnSettingPopover
  },
  emits: ['loaded'],
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    filterTable: {
      type: Function,
      default: () => ({})
    },
    getTableMetadata: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      loading: true,
      method: 'get',
      meta: {},
      iConfig: {},
      autoConfig: {},
      cleanedColumnsShow: {},
      totalColumns: [],
      popoverColumns: {
        totalColumnsList: [],
        minCols: [],
        currentCols: [],
        defaultCols: []
      },
      isDeactivated: false,
      tableColumnsStorage: this.getTableColumnsStorage(),
      sortable: null,
      columnResizeObserver: null,
      columnResizeFrame: null,
      columnContainerWidth: 0,
      pinningMediaQuery: null,
      pinningDisabled: typeof window !== 'undefined' ? window.innerWidth < 992 : false,
      naturalColumnWidths: {},
      pinnedColumnProps: [],
      cellWheelGesture: null,
      inited: false
    }
  },
  watch: {
    pinningDisabled() {
      this.refreshPinningAvailability()
    },
    'config.url': {
      handler: _.debounce(function (newUrl, oldUrl) {
        if (this.isDeactivated || !this.inited || !newUrl || newUrl === oldUrl) {
          return
        }

        this.optionUrlMetaAndGenCols({ reload: false })
        this.$log.debug('AutoDataTable URL change found')
      }, 200)
    },
    config: {
      immediate: false,
      handler: _.debounce(function (iNew, iOld) {
        if (this.isDeactivated || !this.inited) {
          return
        }
        // URL changes are handled separately so later column/config updates
        // cannot overwrite the pending URL refresh in this debounced watcher.
        if (iNew?.url !== iOld?.url) {
          return
        }
        const changed = this.isConfigChanged(iNew, iOld)
        if (!changed) {
          return
        }

        this.optionUrlMetaAndGenCols({ reload: true })
        this.$log.debug('AutoDataTable Config change found')
      }, 200)
    }
  },
  async created() {
    await this.optionUrlMetaAndGenCols()
    this.loading = false
  },
  mounted() {
    this.initPinningMediaQuery()
    if (typeof ResizeObserver === 'undefined') {
      return
    }
    this.columnResizeObserver = new ResizeObserver(([entry]) => {
      const width = Math.floor(entry?.contentRect.width || 0)
      if (!width || Math.abs(width - this.columnContainerWidth) <= COLUMN_WIDTH_CHANGE_TOLERANCE) {
        return
      }

      this.columnContainerWidth = width
      this.scheduleColumnFit(width)
    })
    this.columnResizeObserver.observe(this.$el)
    this.initializeStaticColumnWidths()
  },
  beforeUnmount() {
    this.clearCellWheelGesture()
    if (this.pinningMediaQuery) {
      if (typeof this.pinningMediaQuery.removeEventListener === 'function') {
        this.pinningMediaQuery.removeEventListener('change', this.handlePinningMediaChange)
      } else {
        this.pinningMediaQuery.removeListener(this.handlePinningMediaChange)
      }
    }
    this.columnResizeObserver?.disconnect()
    this.cancelColumnFit()
  },
  deactivated() {
    this.isDeactivated = true
    this.clearCellWheelGesture()
    this.cancelColumnFit()
    this.columnContainerWidth = 0
  },
  activated() {
    this.isDeactivated = false
  },
  methods: {
    handleLoaded() {
      this.$emit('loaded')
    },
    handleCellWheel(event) {
      const delta = getHorizontalWheelDelta(
        event,
        Boolean(this.cellWheelGesture),
        this.$el.clientWidth
      )
      if (!delta) {
        return
      }

      const target = getWheelEventTarget(event)
      const now = performance.now()
      let gesture = this.cellWheelGesture
      if (
        gesture &&
        (!gesture.scrollContainer.isConnected ||
          !this.$el.contains(gesture.scrollContainer) ||
          shouldRestartCellWheelGesture(gesture, target, delta, now))
      ) {
        this.clearCellWheelGesture()
        gesture = null
      }

      if (!gesture) {
        const scrollTarget = findCellScrollTarget(this.$el, target)
        if (!scrollTarget) {
          return
        }
        gesture = {
          ...scrollTarget,
          lastDelta: delta,
          lastTime: now,
          timer: null
        }
        this.cellWheelGesture = gesture
      }

      event.preventDefault()
      event.stopPropagation()
      gesture.scrollContainer.scrollLeft += delta
      gesture.lastDelta = delta
      gesture.lastTime = now
      this.scheduleCellWheelGestureEnd(gesture)
    },
    scheduleCellWheelGestureEnd(gesture) {
      clearTimeout(gesture.timer)
      gesture.timer = setTimeout(this.clearCellWheelGesture, CELL_WHEEL_GESTURE_GAP)
    },
    clearCellWheelGesture() {
      clearTimeout(this.cellWheelGesture?.timer)
      this.cellWheelGesture = null
    },
    initPinningMediaQuery() {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return
      }
      this.pinningMediaQuery = window.matchMedia('(max-width: 991px)')
      this.pinningDisabled = this.pinningMediaQuery.matches
      if (typeof this.pinningMediaQuery.addEventListener === 'function') {
        this.pinningMediaQuery.addEventListener('change', this.handlePinningMediaChange)
      } else {
        this.pinningMediaQuery.addListener(this.handlePinningMediaChange)
      }
    },
    handlePinningMediaChange(event) {
      this.pinningDisabled = event.matches
    },
    scheduleColumnFit(containerWidth) {
      this.cancelColumnFit()
      this.columnResizeFrame = requestAnimationFrame(() => {
        this.columnResizeFrame = null
        this.fitColumnsToContainer(undefined, containerWidth)
      })
    },
    cancelColumnFit() {
      if (!this.columnResizeFrame) {
        return
      }
      cancelAnimationFrame(this.columnResizeFrame)
      this.columnResizeFrame = null
    },
    initializeStaticColumnWidths() {
      if (!Array.isArray(this.iConfig.columns)) {
        return
      }

      const columns = this.iConfig.columns.map((currentColumn) => {
        const col = { ...currentColumn }
        col.width = col.width || col.minWidth
        delete col.minWidth
        return col
      })

      this.naturalColumnWidths = Object.fromEntries(columns.map((item) => [item.prop, item.width]))
      const containerWidth = Math.floor(this.$el.clientWidth || 0)
      if (containerWidth) {
        this.columnContainerWidth = containerWidth
      }
      this.fitColumnsToContainer(columns, containerWidth)
    },
    fitColumnsToContainer(sourceColumns = this.iConfig.columns, observedWidth = 0) {
      if (
        !Array.isArray(sourceColumns) ||
        sourceColumns.length === 0 ||
        Object.keys(this.naturalColumnWidths).length === 0
      ) {
        return
      }

      const containerWidth = observedWidth || this.$el.clientWidth
      if (!containerWidth) {
        this.commitColumnWidths(sourceColumns)
        return
      }

      const selectionColumn = this.$el.querySelector(
        [
          '.el-table__header .el-table-column--selection',
          '.el-table__body-header .el-table-column--selection'
        ].join(', ')
      )
      const selectionWidth = selectionColumn?.getBoundingClientRect().width || 0
      const availableWidth = Math.max(0, Math.floor(containerWidth - selectionWidth - 2))

      const naturalColumns = sourceColumns.map((currentColumn) => {
        const col = { ...currentColumn }
        const naturalWidth = this.naturalColumnWidths[col.prop]
        if (naturalWidth) {
          col.width = naturalWidth
          delete col.minWidth
        }
        return col
      })
      const pixelWidths = naturalColumns.map((col) => Number.parseFloat(col.width) || 0)
      const naturalTotalWidth = pixelWidths.reduce((total, width) => total + width, 0)
      if (!naturalTotalWidth) {
        return
      }

      let flexibleColumnIndexes = naturalColumns
        .map((col, index) => ({ col, index }))
        .filter(({ col }) => !col.fixed && col.fitWidth !== false)
        .map(({ index }) => index)

      // Compact-only views (for example, id + actions) have no naturally flexible
      // column. Let the first data column absorb the empty space so the fixed-width
      // actions column still reaches the right edge of the table.
      if (naturalTotalWidth < availableWidth && flexibleColumnIndexes.length === 0) {
        const fallbackIndex = naturalColumns.findIndex(
          (col) => col.prop !== 'actions' && !col.fixed
        )
        if (fallbackIndex !== -1) {
          flexibleColumnIndexes = [fallbackIndex]
        }
      }
      const flexibleColumnIndexSet = new Set(flexibleColumnIndexes)
      const fixedTotalWidth = pixelWidths.reduce((total, width, index) => {
        return flexibleColumnIndexSet.has(index) ? total : total + width
      }, 0)
      const flexibleTotalWidth = naturalTotalWidth - fixedTotalWidth
      const flexibleAvailableWidth = Math.max(0, availableWidth - fixedTotalWidth)
      const scale =
        naturalTotalWidth < availableWidth && flexibleTotalWidth > 0
          ? flexibleAvailableWidth / flexibleTotalWidth
          : 1
      const fittedColumns = naturalColumns.map((col, index) => {
        const isFlexible = flexibleColumnIndexSet.has(index)
        const width = Math.floor(pixelWidths[index] * (isFlexible ? scale : 1))
        col.width = `${width}px`
        return col
      })

      if (flexibleColumnIndexes.length > 0) {
        const fittedTotalWidth = fittedColumns.reduce(
          (total, col) => total + (Number.parseFloat(col.width) || 0),
          0
        )
        const remainingWidth = Math.max(0, availableWidth - fittedTotalWidth)
        if (remainingWidth > 0) {
          const targetIndex = flexibleColumnIndexes[0]
          const targetWidth = Number.parseFloat(fittedColumns[targetIndex].width) || 0
          fittedColumns[targetIndex].width = `${targetWidth + remainingWidth}px`
        }
      }

      this.commitColumnWidths(fittedColumns)
    },
    commitColumnWidths(columns) {
      const currentSignature = this.iConfig.columns.map((item) => [item.prop, item.width])
      const nextSignature = columns.map((item) => [item.prop, item.width])
      if (_.isEqual(currentSignature, nextSignature)) {
        return
      }

      this.iConfig = {
        ...this.iConfig,
        columns
      }
    },
    openColumnSetting() {
      this.$refs.columnSettingPopover?.open()
    },
    normalizeColumnNames(value, fallback = []) {
      if (Array.isArray(value)) {
        const columns = orderPrimaryColumns(
          value.filter((item) => item !== undefined && item !== null)
        )
        return orderActionColumn(columns, this.config.actionsColumnPosition)
      }
      if (Array.isArray(fallback)) {
        const columns = orderPrimaryColumns([...fallback])
        return orderActionColumn(columns, this.config.actionsColumnPosition)
      }
      return []
    },
    isConfigChanged(iNew, iOld) {
      const normalizeConfig = (config) => {
        const rest = { ...(config || {}) }
        delete rest.columns
        const columnsMeta = rest.columnsMeta
        const normalizedMeta = Object.fromEntries(
          Object.entries(columnsMeta || {}).map(([key, value]) => {
            if (!value || typeof value !== 'object') {
              return [key, value]
            }
            const meta = { ...value }
            delete meta.formatter
            return [key, meta]
          })
        )
        return { ...rest, columnsMeta: normalizedMeta }
      }
      const _iNew = normalizeConfig(iNew)
      const _iOld = normalizeConfig(iOld)

      try {
        if (JSON.stringify(_iNew) === JSON.stringify(_iOld)) {
          return false
        }
      } catch (error) {
        this.$log.error('JsonStringify Error: ', error)
      }
      return true
    },
    setColumnDraggable() {
      const el = this.$el.querySelector(
        '.el-table__header-wrapper thead tr, .el-table__body-header tr'
      )
      if (!el) {
        setTimeout(() => this.setColumnDraggable(), 500)
        return
      }
      if (this.sortable) {
        this.sortable.destroy()
      }

      this.sortable = Sortable.create(el, {
        animation: 150,
        filter: '.column-pin-button',
        preventOnFilter: false,
        onMove: ({ dragged, related }) => {
          const draggedIsPinned = dragged.querySelector('.column-pin-button.is-pinned')
          const relatedIsPinned = related?.querySelector('.column-pin-button.is-pinned')
          return !draggedIsPinned && !relatedIsPinned
        },
        onEnd: (evt) => {
          let { oldIndex, newIndex } = evt
          if (oldIndex === newIndex) {
            return
          }
          // 检测表格是否有选择列
          const hasSelectionColumn = this.$el.querySelector('.el-table-column--selection') !== null
          if (hasSelectionColumn) {
            // 如果有选择列，调整索引
            if (oldIndex > 0) oldIndex -= 1
            if (newIndex > 0) newIndex -= 1
          }

          const displayedColumnNames = this.iConfig.columns.map((item) => item.prop)
          // 边界
          if (
            oldIndex >= 0 &&
            oldIndex < displayedColumnNames.length &&
            newIndex >= 0 &&
            newIndex < displayedColumnNames.length
          ) {
            const movedItem = displayedColumnNames.splice(oldIndex, 1)[0]
            displayedColumnNames.splice(newIndex, 0, movedItem)

            const columnNames = orderActionColumn(
              displayedColumnNames,
              this.config.actionsColumnPosition
            )

            this.$log.debug('Column moved: ', movedItem, oldIndex, ' => ', newIndex)
            // 保存更新的列顺序
            this.tableColumnsStorage.set(columnNames)

            // 更新内部状态
            this.cleanedColumnsShow.show = columnNames
            this.popoverColumns.currentCols = columnNames

            // 重新应用列顺序
            this.filterShowColumns()

            this.loading = true
            setTimeout(() => {
              this.loading = false
              // 在DOM完全更新后重新初始化拖拽
              this.$nextTick(() => {
                setTimeout(() => this.setColumnDraggable(), 200)
              })
            }, 300)
          }
        }
      })
    },
    generateTotalColumns() {
      const generator = new TableColumnsGenerator(this.config, this.meta, this)
      this.totalColumns = generator.generateColumns()
      this.config.columns = this.totalColumns
      this.iConfig = {
        ...this.config,
        columns: [...this.totalColumns],
        tableAttrs: {
          tableLayout: 'auto',
          ...this.config.tableAttrs
        }
      }
    },
    async optionUrlMetaAndGenCols({ reload = false } = {}) {
      if (!this.config.url) {
        return
      }
      const url =
        this.config.url.indexOf('?') === -1
          ? `${this.config.url}?display=1`
          : `${this.config.url}&display=1`

      /**
       * 原有代码无法正确的同步 storage 的原因是 currentOrder 总是在 totalColumns 之前进行的
       * 这导致在首次加载时，currentOrder总是为空数组，因为此时cleanedColumnsShow.show还未初始化
       */
      try {
        const data = this.getTableMetadata
          ? await this.getTableMetadata()
          : await this.$store.dispatch('common/getUrlMeta', { url })
        const method = this.method.toUpperCase()
        const actionMeta = getActionMeta(data, method)
        const filters = getFilterMeta(data)
        const ordering = getOrderingMeta(data)
        this.meta = this.applyQueryCapabilities(actionMeta, filters, ordering)

        this.generateTotalColumns()
        this.cleanColumnsShow()
        this.filterShowColumns({ reload })
        this.generatePopoverColumns()
        this.setColumnDraggable()
      } catch (error) {
        this.$log.error('Error occur: ', error)
      }
    },
    applyQueryCapabilities(actionMeta, filters, ordering) {
      const meta = Object.fromEntries(
        Object.entries(actionMeta).map(([name, value]) => [name, { ...value }])
      )
      for (const name of Object.keys(filters)) {
        if (!meta[name]) {
          continue
        }
        meta[name].filter = true
      }
      for (const { name } of ordering.fields || []) {
        if (name && meta[name]) {
          meta[name].order = true
        }
      }
      return meta
    },
    getTableColumnsStorage() {
      let tableName = this.config.name || this.$route.name + '_' + newURL(this.config.url).pathname
      tableName = replaceAllUUID(tableName)
      return new ObjectLocalStorage('tableColumns', tableName)
    },
    // 生成给子组件使用的TotalColList
    cleanColumnsShow() {
      const totalColumnsNames = this.totalColumns.map((obj) => obj.prop)
      // 默认列
      let defaultColumnsNames = _.get(this.iConfig, 'columnsShow.default', [])
      if (defaultColumnsNames.length === 0) {
        defaultColumnsNames = totalColumnsNames
      }
      defaultColumnsNames = defaultColumnsNames.filter((name) => !isDefaultHiddenColumn(name))

      // 最小列
      const minColumnsNames = _.get(this.iConfig, 'columnsShow.min', ['actions']).filter(
        (name) => !isDefaultHiddenColumn(name) && totalColumnsNames.includes(name)
      )

      const configShowColumnsNames = this.tableColumnsStorage.get()
      let showColumnsNames = this.normalizeColumnNames(configShowColumnsNames, defaultColumnsNames)
      if (showColumnsNames.length === 0) {
        showColumnsNames = [...totalColumnsNames]
      }
      // 校对显示的列，是不是包含最小列
      minColumnsNames.forEach((v, i) => {
        if (showColumnsNames.indexOf(v) === -1) {
          showColumnsNames.push(v)
        }
      })

      this.cleanedColumnsShow = {
        default: defaultColumnsNames,
        show: showColumnsNames,
        min: minColumnsNames,
        configShow: configShowColumnsNames
      }
      this.$log.debug('Cleaned columns show: ', this.cleanedColumnsShow)
    },
    filterShowColumns({ reload = false } = {}) {
      this.cleanColumnsShow()
      const showFieldNames = this.normalizeColumnNames(this.cleanedColumnsShow.show)
      let showFields = this.totalColumns.filter((obj) => {
        return showFieldNames.indexOf(obj.prop) > -1
      })
      showFields = this.orderingColumns(showFields)
      this.config.columns = showFields
      this.iConfig.columns = this.applyPinnedColumns(showFields)

      this.$nextTick(() => {
        this.initializeStaticColumnWidths()
        if (reload && this.$refs.dataTable) {
          this.$refs.dataTable.getList()
        }
        this.inited = true
      })
    },
    orderingColumns(columns) {
      const cols = Array.isArray(this.config.columns) ? [...this.config.columns] : []
      const show = this.normalizeColumnNames(this.cleanedColumnsShow.show, cols)
      const ordering = (show || cols || []).map((item) => {
        let prop = item
        if (typeof item === 'object') {
          prop = item.prop
        }
        return prop
      })
      const sorted = _.sortBy(columns, (item) => {
        const i = ordering.indexOf(item.prop)
        item.order = i
        return i === -1 ? 999 : i
      })
      return [
        ...sorted.filter((item) => item.type === 'expand'),
        ...sorted.filter((item) => item.type === 'index'),
        ...sorted.filter((item) => !['expand', 'index'].includes(item.type))
      ]
    },
    applyPinnedColumns(columns) {
      const getOriginalFixed = (item) => {
        return Object.prototype.hasOwnProperty.call(item, 'pinOriginalFixed')
          ? item.pinOriginalFixed
          : item.fixed
      }
      const pinnableProps = new Set(
        columns
          .filter((item) => {
            const originalFixed = getOriginalFixed(item)
            return item.prop !== 'actions' && originalFixed !== 'left' && originalFixed !== 'right'
          })
          .map((item) => item.prop)
      )
      this.pinnedColumnProps = this.pinnedColumnProps.filter((prop) => pinnableProps.has(prop))
      if (this.pinningDisabled) {
        this.pinnedColumnProps = []
      }
      const pinnedSet = new Set(this.pinnedColumnProps)
      const pinLimitReached = this.pinnedColumnProps.length >= 3

      return columns.map((item) => {
        const col = { ...item }
        const originalFixed = getOriginalFixed(col)
        const isPinned = pinnedSet.has(col.prop)

        col.pinOriginalFixed = originalFixed
        col.fixed = isPinned ? 'left' : originalFixed
        col.pinState = {
          pinned: isPinned,
          visible:
            !this.pinningDisabled && pinnableProps.has(col.prop) && (isPinned || !pinLimitReached)
        }
        return col
      })
    },
    refreshPinningAvailability() {
      if (!Array.isArray(this.iConfig.columns) || this.iConfig.columns.length === 0) {
        return
      }
      this.iConfig.columns = this.applyPinnedColumns(this.iConfig.columns)
    },
    toggleColumnPin(prop) {
      const columnIndex = this.iConfig.columns.findIndex((item) => item.prop === prop)
      const column = this.iConfig.columns[columnIndex]
      if (columnIndex === -1 || !column.pinState?.visible) {
        return
      }

      const pinnedIndex = this.pinnedColumnProps.indexOf(prop)
      const isPinned = pinnedIndex !== -1
      if (pinnedIndex !== -1) {
        this.pinnedColumnProps.splice(pinnedIndex, 1)
      } else {
        if (this.pinnedColumnProps.length >= 3) {
          return
        }
        this.pinnedColumnProps.push(prop)
      }

      this.iConfig.columns.splice(columnIndex, 1, {
        ...column,
        fixed: isPinned ? column.pinOriginalFixed : 'left',
        pinState: {
          ...column.pinState,
          pinned: !isPinned
        }
      })
    },
    generatePopoverColumns() {
      this.popoverColumns.totalColumnsList = this.totalColumns.filter((obj) => {
        if (obj.label) {
          return { prop: obj.prop, label: obj.label }
        }
      })
      this.popoverColumns.currentCols = this.normalizeColumnNames(this.cleanedColumnsShow.show)
      this.popoverColumns.minCols = this.cleanedColumnsShow.min
      this.popoverColumns.defaultCols = this.cleanedColumnsShow.default

      this.$log.debug('Popover cols: ', this.popoverColumns)
    },
    handlePopoverColumnsChange({ columns, url }) {
      this.$log.debug('Columns change: ', columns)
      if (columns === null) {
        columns = this.cleanedColumnsShow.default
      }
      columns = this.normalizeColumnNames(columns, this.cleanedColumnsShow.default)
      this.popoverColumns.currentCols = columns
      this.tableColumnsStorage.set(columns)
      this.filterShowColumns()
    },
    filterChange(filters) {
      const key = Object.keys(filters)[0]
      const attr = {}
      attr[key] = filters[key][0]
      this.filterTable(attr)
    }
  }
}
</script>

<style lang="scss" scoped>
.auto-data-table {
  width: 100%;
  min-width: 0;

  // Headers always stay on one line. The column generator reserves enough width for
  // the complete label, and the table scrolls horizontally when the viewport is narrow.
  :deep(.el-table__header th .cell),
  :deep(.el-table__body-header th .cell) {
    height: auto;
    overflow: visible;
    line-height: 1.4;
    text-overflow: clip;
    white-space: nowrap;
  }

  :deep(.el-table__header th .cell > span),
  :deep(.el-table__body-header th .cell > span) {
    white-space: nowrap;
  }

  // All body cells remain on one line. Overflow belongs to the cell itself so
  // mouse wheels with Shift, trackpads and touch gestures can reveal the full
  // value without changing the row height.
  :deep(.el-table__body td.el-table__cell .cell) {
    max-width: 100%;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    line-height: 1.5;
    scrollbar-width: none;
    -ms-overflow-style: none;
    text-overflow: clip !important;
    white-space: nowrap !important;
  }

  :deep(.el-table__body td.el-table__cell .cell::-webkit-scrollbar) {
    display: none;
  }

  :deep(.el-table__body td.el-table__cell .cell *) {
    white-space: nowrap !important;
    overflow-wrap: normal !important;
    word-break: normal !important;
  }

  :deep(.el-table__body td.el-table__cell .cell > :not(.label-container)) {
    min-width: max-content;
    max-width: none !important;
  }

  :deep(.el-table__body td.custom-render-table-column .platform-td),
  :deep(.el-table__body td.custom-render-table-column .tag),
  :deep(.el-table__body td.custom-render-table-column .protocol-cell) {
    display: flex;
    flex-wrap: nowrap;
  }

  :deep(.el-table__body td.custom-render-table-column .tag > span),
  :deep(.el-table__body td.custom-render-table-column .el-tag) {
    max-width: none;
    overflow: visible;
    text-overflow: clip;
    white-space: nowrap;
  }

  :deep(.el-table__body td.custom-render-table-column .label-formatter-col) {
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    padding-right: 0;
    overflow: hidden;
  }

  :deep(.el-table__body td.custom-render-table-column .label-container) {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    height: 23px;
    min-height: 23px;
    flex-wrap: nowrap;
    justify-content: flex-start;
    overflow: hidden;
  }

  :deep(.el-table__body td.custom-render-table-column .label-wrapper) {
    display: flex;
    width: 100%;
    height: 23px;
    min-width: 0;
    max-width: 100%;
    flex-wrap: nowrap;
    align-items: center;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
  }

  :deep(.el-table__body td.custom-render-table-column .label-container .tag-formatter) {
    max-width: none;
    overflow: visible;
    text-overflow: clip;
    white-space: nowrap;
  }
}
</style>
