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
      popoverColumns: {
        totalColumnsList: [],
        minCols: [],
        currentCols: [],
        defaultCols: []
      },
      isDeactivated: false,
      tableColumnsStorage: this.getTableColumnsStorage(),
      sortable: null
    }
  },
  watch: {
    config: {
      handler: _.debounce(function(iNew, iOld) {
        if (this.isDeactivated) {
          return
        }
        try {
          if (JSON.stringify(iNew) === JSON.stringify(iOld)) {
            return
          }
        } catch (error) {
          this.$log.error('JsonStringify Error: ', error)
        }

        this.optionUrlMetaAndGenCols()
        this.$log.debug('AutoDataTable Config change found, ', this.isDeactivated)
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
      if (this.config.url === '') {
        return
      }
      const url = (this.config.url.indexOf('?') === -1)
        ? `${this.config.url}?display=1`
        : `${this.config.url}&display=1`

      /**
       * 原有代码无法正确的同步 storage 的原因是 currentOrder 总是在 totalColumns 之前进行的
       * 这导致在首次加载时，currentOrder总是为空数组，因为此时cleanedColumnsShow.show还未初始化
       */
      try {
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
