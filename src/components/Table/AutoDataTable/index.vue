<template>
  <div>
    <DataTable
      v-if="!loading"
      ref="dataTable"
      v-loading="loading"
      :config="iConfig"
      v-bind="$attrs"
      v-on="$listeners"
      @filter-change="filterChange"
    />
    <ColumnSettingPopover
      :current-columns="popoverColumns.currentCols"
      :default-columns="popoverColumns.defaultCols"
      :min-columns="popoverColumns.minCols"
      :total-columns-list="popoverColumns.totalColumnsList"
      :url="config.url"
      @columnsUpdate="handlePopoverColumnsChange"
    />
  </div>
</template>

<script type="text/jsx">
import Sortable from 'sortablejs'
import DataTable from '@/components/Table/DataTable/index.vue'
import { newURL, ObjectLocalStorage, replaceAllUUID } from '@/utils/common/index'
import ColumnSettingPopover from './components/ColumnSettingPopover.vue'
import { TableColumnsGenerator } from './utils'

export default {
  name: 'AutoDataTable',
  components: {
    DataTable,
    ColumnSettingPopover
  },
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    filterTable: {
      type: Function,
      default: () => ({})
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
      // 用于去重同一 URL 的列元数据请求，避免短时间内重复发起 OPTIONS
      lastMetaUrl: '',
      popoverColumns: {
        totalColumnsList: [],
        minCols: [],
        currentCols: [],
        defaultCols: []
      },
      isDeactivated: false,
      tableColumnsStorage: this.getTableColumnsStorage(),
      sortable: null,
      inited: false
    }
  },
  watch: {
    config: {
      immediate: false,
      handler: _.debounce(function(iNew, iOld) {
        // 组件处于 deactivated 状态时不处理
        if (this.isDeactivated) return

        const newUrl = iNew?.url || ''
        const oldUrl = iOld?.url || ''

        // 允许在 未初始化且 URL 从空 -> 非空 时执行一次初始化
        // 组件初次创建若 URL 为空不会初始化，后续仅变更 config 会被 inited 短路
        if (!this.inited && !oldUrl && newUrl) {
          this.optionUrlMetaAndGenCols()
          return
        }

        // 未初始化且非 空->非空 场景：保持静默，避免误触发
        if (!this.inited) return
        const changed = this.isConfigChanged(iNew, iOld)
        if (!changed) return

        this.optionUrlMetaAndGenCols()
        this.$log.debug('AutoDataTable Config change found')
      }, 200)
    }
  },
  async created() {
    await this.optionUrlMetaAndGenCols()
    this.loading = false
  },
  deactivated() {
    this.isDeactivated = true
  },
  activated() {
    this.isDeactivated = false
  },
  methods: {
    isConfigChanged(iNew, iOld) {
      const _iNew = _.cloneDeep(iNew)
      const _iOld = _.cloneDeep(iOld)
      delete _iNew.columns
      delete _iOld.columns
      const oldMeta = _iNew.columnsMeta
      const newMeta = _iOld.columnsMeta
      const metas = [oldMeta, newMeta]
      for (const meta of metas) {
        if (!meta) {
          continue
        }
        for (const [key, value] of Object.entries(meta)) {
          if (!key || !value || typeof value !== 'object') {
            continue
          }
          delete value['formatter']
        }
      }

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
      const el = this.$el.querySelector('.el-table__header-wrapper thead tr')
      if (!el) {
        setTimeout(() => this.setColumnDraggable(), 500)
        return
      }
      if (this.sortable) {
        this.sortable.destroy()
      }

      this.sortable = Sortable.create(el, {
        animation: 150,
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

          let columnNames = [...this.cleanedColumnsShow.show]
          if (columnNames.includes('actions')) {
            columnNames = columnNames.filter(item => item !== 'actions')
            columnNames.push('actions')
          }
          // 边界
          if (oldIndex >= 0 && oldIndex < columnNames.length &&
            newIndex >= 0 && newIndex < columnNames.length) {
            const movedItem = columnNames.splice(oldIndex, 1)[0]
            columnNames.splice(newIndex, 0, movedItem)

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
      this.iConfig = _.cloneDeep(this.config)
    },
    async optionUrlMetaAndGenCols() {
      // URL 为空直接跳过，等待上层设置好 URL
      if (this.config.url === '') return
      const url = (this.config.url.indexOf('?') === -1)
        ? `${this.config.url}?display=1`
        : `${this.config.url}&display=1`

      // 去重：同一 URL 的元数据已获取过，则不再重复请求，减少重复 OPTIONS
      if (this.lastMetaUrl === url) {
        return
      }

      /**
       * 原有代码无法正确的同步 storage 的原因是 currentOrder 总是在 totalColumns 之前进行的
       * 这导致在首次加载时，currentOrder总是为空数组，因为此时cleanedColumnsShow.show还未初始化
       */
      try {
        this.lastMetaUrl = url
        const data = await this.$store.dispatch('common/getUrlMeta', { url: url })
        const method = this.method.toUpperCase()
        this.meta = data.actions && data.actions[method] ? data.actions[method] : {}

        this.generateTotalColumns()
        this.cleanColumnsShow()
        this.filterShowColumns()
        this.generatePopoverColumns()
        this.setColumnDraggable()
      } catch (error) {
        this.$log.error('Error occur: ', error)
      }
    },
    getTableColumnsStorage() {
      let tableName = this.config.name || this.$route.name + '_' + newURL(this.config.url).pathname
      tableName = replaceAllUUID(tableName)
      return new ObjectLocalStorage('tableColumns', tableName)
    },
    // 生成给子组件使用的TotalColList
    cleanColumnsShow() {
      const totalColumnsNames = this.totalColumns.map(obj => obj.prop)
      // 默认列
      let defaultColumnsNames = _.get(this.iConfig, 'columnsShow.default', [])
      if (defaultColumnsNames.length === 0) {
        defaultColumnsNames = totalColumnsNames
      }

      // 最小列
      const minColumnsNames = _.get(this.iConfig, 'columnsShow.min', ['actions', 'id'])
        .filter(n => totalColumnsNames.includes(n))

      const configShowColumnsNames = this.tableColumnsStorage.get()
      let showColumnsNames = configShowColumnsNames || defaultColumnsNames
      if (showColumnsNames.length === 0) {
        showColumnsNames = totalColumnsNames
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
    filterShowColumns() {
      this.cleanColumnsShow()
      const showFieldNames = this.cleanedColumnsShow.show
      let showFields = this.totalColumns.filter(obj => {
        return showFieldNames.indexOf(obj.prop) > -1
      })
      showFields = this.orderingColumns(showFields)
      this.iConfig.columns = showFields

      // 确保最新的列配置也应用到config对象上，保持同步
      this.config.columns = this.iConfig.columns

      this.$nextTick(() => {
        if (this.$refs.dataTable) {
          this.$refs.dataTable.getList()
        }
        this.inited = true
      })
    },
    orderingColumns(columns) {
      const cols = _.cloneDeep(this.config.columns)
      const show = this.cleanedColumnsShow.show
      const ordering = (show || cols || []).map(item => {
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
      return sorted
    },
    generatePopoverColumns() {
      this.popoverColumns.totalColumnsList = this.totalColumns.filter(obj => {
        if (obj.label) {
          return { prop: obj.prop, label: obj.label }
        }
      })
      this.popoverColumns.currentCols = this.cleanedColumnsShow.show
      this.popoverColumns.minCols = this.cleanedColumnsShow.min
      this.popoverColumns.defaultCols = this.cleanedColumnsShow.default

      this.$log.debug('Popover cols: ', this.popoverColumns)
    },
    handlePopoverColumnsChange({ columns, url }) {
      this.$log.debug('Columns change: ', columns)
      if (columns === null) {
        columns = this.cleanedColumnsShow.default
      }
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
