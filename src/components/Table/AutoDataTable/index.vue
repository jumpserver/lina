<template>
  <div v-loading="loading">
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
import DataTable from '@/components/Table/DataTable/index.vue'
import {
  ActionsFormatter,
  ArrayFormatter,
  ChoicesFormatter,
  CopyableFormatter,
  DateFormatter,
  DetailFormatter,
  DisplayFormatter,
  ObjectRelatedFormatter
} from '@/components/Table/TableFormatters'
import i18n from '@/i18n/i18n'
import { newURL, ObjectLocalStorage, replaceAllUUID, toSentenceCase } from '@/utils/common'
import ColumnSettingPopover from './components/ColumnSettingPopover.vue'
import LabelsFormatter from '@/components/Table/TableFormatters/LabelsFormatter.vue'

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
      autoConfig: {},
      iConfig: {},
      meta: {},
      cleanedColumnsShow: {},
      totalColumns: [],
      popoverColumns: {
        totalColumnsList: [],
        minCols: [],
        currentCols: [],
        defaultCols: []
      },
      isDeactivated: false,
      objTableColumns: new ObjectLocalStorage('tableColumns')
    }
  },
  computed: {
    dynamicActionWidth() {
      if (this.$i18n.locale === 'en') {
        return '120px'
      }
      if (this.$i18n.locale === 'pt-br') {
        return '160px'
      }
      return '100px'
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
  created() {
    this.optionUrlMetaAndGenCols()
  },
  deactivated() {
    this.isDeactivated = true
  },
  activated() {
    this.isDeactivated = false
  },
  methods: {
    async optionUrlMetaAndGenCols() {
      if (this.config.url === '') {
        return
      }
      const url = (this.config.url.indexOf('?') === -1)
        ? `${this.config.url}?draw=1&display=1`
        : `${this.config.url}&draw=1&display=1`
      this.$store.dispatch('common/getUrlMeta', { url: url }).then(data => {
        const method = this.method.toUpperCase()
        this.meta = data.actions && data.actions[method] ? data.actions[method] : {}
        this.generateTotalColumns()
      }).then(() => {
        //  根据当前列重新生成最终渲染表格
        this.filterShowColumns()
      }).then(() => {
        // 生成给子组件使用的TotalColList
        this.generatePopoverColumns()
      }).catch((error) => {
        this.$log.error('Error occur: ', error)
      }).finally(() => {
        this.loading = false
      })
    },
    generateColumnByName(name, col) {
      switch (name) {
        case 'id':
          if (!col.width) {
            col.width = '290px'
          }
          if (!col.formatter) {
            col.formatter = CopyableFormatter
            col.iconPosition = 'left'
          }
          break
        case 'name':
          col.formatter = DetailFormatter
          col.sortable = 'custom'
          col.showOverflowTooltip = true
          col.minWidth = '150px'
          break
        case 'actions':
          col = {
            prop: 'actions',
            label: i18n.t('Actions'),
            align: 'center',
            width: this.dynamicActionWidth,
            formatter: ActionsFormatter,
            fixed: 'right',
            formatterArgs: {}
          }
          break
        case 'is_valid':
          col.label = i18n.t('Valid')
          col.formatter = ChoicesFormatter
          col.formatterArgs = {
            textChoices: {
              true: i18n.t('Yes'),
              false: i18n.t('No')
            }
          }
          col.width = '80px'
          break
        case 'is_active':
          col.formatter = ChoicesFormatter
          col.formatterArgs = {
            textChoices: {
              true: i18n.t('Active'),
              false: i18n.t('Inactive')
            }
          }
          col.width = '100px'
          break
        case 'datetime':
        case 'date_start':
          col.formatter = DateFormatter
          break
        case 'labels':
          col.formatter = LabelsFormatter
          col.width = '200px'
          break
        case 'comment':
          col.showOverflowTooltip = true
      }
      return col
    },
    generateColumnByType(type, col, meta) {
      switch (type) {
        case 'choice':
          col.sortable = 'custom'
          col.formatter = DisplayFormatter
          break
        case 'labeled_choice':
          col.sortable = 'custom'
          col.formatter = ChoicesFormatter
          break
        case 'boolean':
          col.formatter = ChoicesFormatter
          // col.width = '80px'
          break
        case 'datetime':
          col.formatter = DateFormatter
          col.width = '155px'
          break
        case 'object_related_field':
          col.formatter = ObjectRelatedFormatter
          break
        case 'm2m_related_field':
          col.formatter = ObjectRelatedFormatter
          break
        case 'list':
          col.formatter = ArrayFormatter
          break
        case 'json':
        case 'field':
          if (meta.child && meta.child.type === 'nested object') {
            col.formatter = ObjectRelatedFormatter
          }
          break
      }
      // this.$log.debug('Field: ', type, col.prop, col)
      return col
    },
    addHelpTipIfNeed(col) {
      const helpTip = col.helpTip
      if (!helpTip) {
        return col
      }
      col.renderHeader = (h, { column, $index }) => {
        const binds = {
          props: {
            placement: 'bottom',
            effect: 'dark',
            openDelay: 500,
            popperClass: 'help-tips'
          }
        }

        return (
          <span>{column.label}
            <el-tooltip {...binds}>
              <div slot='content' v-sanitize={helpTip}/>
              <i class='fa fa-question-circle-o help-tip-icon' style='padding-left: 2px'/>
            </el-tooltip>
          </span>
        )
      }
      return col
    },
    addFilterIfNeed(col) {
      if (col.prop) {
        const column = this.meta[col.prop] || {}
        if (!column.filter) {
          return col
        }
        if (column.type === 'boolean') {
          col.filters = [
            { text: i18n.t('Yes'), value: true },
            { text: i18n.t('No'), value: false }
          ]
          col.sortable = false
          col['column-key'] = col.prop
        }
        if (column.type === 'choice' && column.choices) {
          col.filters = column.choices.map(item => {
            if (typeof (item.value) === 'boolean') {
              if (item.value) {
                return { text: item['label'], value: 'True' }
              } else {
                return { text: item['label'], value: 'False' }
              }
            }
            return { text: item['label'], value: item.value }
          })
          col.sortable = false
          col['column-key'] = col.prop
        }
      }
      return col
    },
    addOrderingIfNeed(col) {
      if (col.prop) {
        const column = this.meta[col.prop] || {}
        if (column.order) {
          col.sortable = 'custom'
          col['column-key'] = col.prop
        }
      }
      return col
    },
    setDefaultFormatterIfNeed(col) {
      if (!col.formatter) {
        col.formatter = (row, column, cellValue) => {
          let value = cellValue
          let padding = '0'
          const excludes = [undefined, null, '']
          if (excludes.indexOf(value) !== -1) {
            padding = '6px'
            value = '-'
          }
          return <span style={{ marginLeft: padding }}>{value}</span>
        }
      }
      return col
    },
    setDefaultWidthIfNeed(col) {
      const lang = this.$i18n.locale
      let factor = 10
      if (lang === 'zh') {
        factor = 20
      }
      let [sortable, filters] = [0, 0]
      if (col && col?.sortable === 'custom') {
        sortable = 10
      }
      if (col && col?.filters?.length > 0) {
        filters = 12
      }
      if (col && !col.width && col.label && !col.minWidth) {
        col.minWidth = `${col.label.length * factor + sortable + filters + 30}px`
      }
      return col
    },
    generateColumn(name) {
      const colMeta = this.meta[name] || {}
      const customMeta = this.config.columnsMeta ? this.config.columnsMeta[name] : {}
      let col = { prop: name, label: colMeta.label, showOverflowTooltip: true }

      col = this.generateColumnByType(colMeta.type, col, colMeta)
      col = this.generateColumnByName(name, col)
      col = this.setDefaultFormatterIfNeed(col)
      col = Object.assign(col, customMeta)
      col = this.addHelpTipIfNeed(col)
      col = this.addFilterIfNeed(col)
      col = this.addOrderingIfNeed(col)
      col = this.updateLabelIfNeed(col)
      col = this.setDefaultWidthIfNeed(col)
      return col
    },
    updateLabelIfNeed(col) {
      if (!col.label) {
        return col
      }
      col.label = col.label
        .replace(' Amount', '')
        .replace(' amount', '')
        .replace('数量', '')
      if (col.label.startsWith('Is ')) {
        col.label = col.label.replace('Is ', '')
      }
      col.label = toSentenceCase(col.label)
      return col
    },
    generateTotalColumns() {
      const config = _.cloneDeep(this.config)
      let columns = []
      const allColumnNames = Object.entries(this.meta)
        .filter(([name, meta]) => !meta['write_only'])
        .map(([name, meta]) => name)
        .concat(config.columnsExtra || [])

      let configColumns = config.columns || allColumnNames
      const columnsExclude = config.columnsExclude || []
      const columnsAdd = config.columnsAdd || []
      configColumns = configColumns.concat(columnsAdd)
      configColumns = configColumns.filter(item => !columnsExclude.includes(item))

      // 解决后端 API 返回字段中包含 actions 的问题;
      const hasColumnActions = configColumns.findIndex(item => item?.prop === 'actions') !== -1
      if (!hasColumnActions) {
        configColumns = [...configColumns.filter(i => i !== 'actions'), 'actions']
      }

      for (let col of configColumns) {
        if (typeof col === 'object') {
          columns.push(col)
        } else if (typeof col === 'string') {
          col = this.generateColumn(col)
          columns.push(col)
        }
      }

      columns = columns.filter(item => {
        if (item?.showFullContent) {
          item.className = 'show-full-content'
        }
        let has = item.has
        if (has === undefined) {
          has = true
        } else if (typeof has === 'function') {
          has = has()
        }
        return has
      })

      columns = this.orderingColumns(columns)
      // 第一次初始化时记录 totalColumns
      this.totalColumns = columns
      config.columns = columns
      this.iConfig = config
    },
    orderingColumns(columns) {
      const cols = _.cloneDeep(this.config.columns)
      const defaults = _.get(this.config, 'columnsShow.default')
      const ordering = (cols || defaults || []).map(item => {
        let prop = item
        if (typeof item === 'object') {
          prop = item.prop
        }
        return prop
      })
      return _.sortBy(columns, (item) => {
        if (item.prop === 'actions') {
          return 1000
        }
        const i = ordering.indexOf(item.prop)
        return i === -1 ? 999 : i
      })
    },
    // 生成给子组件使用的TotalColList
    cleanColumnsShow() {
      const totalColumnsNames = this.totalColumns.map(obj => obj.prop)
      // 默认列
      let defaultColumnsNames = _.get(this.iConfig, 'columnsShow.default', [])
      if (defaultColumnsNames.length === 0) {
        defaultColumnsNames = totalColumnsNames
      }
      // Clean it
      defaultColumnsNames = totalColumnsNames.filter(n => defaultColumnsNames.indexOf(n) > -1)

      // 最小列
      const minColumnsNames = _.get(this.iConfig, 'columnsShow.min', ['actions', 'id'])
        .filter(n => totalColumnsNames.includes(n))

      let tableName = this.config.name || this.$route.name + '_' + newURL(this.config.url).pathname
      tableName = replaceAllUUID(tableName)
      const configShowColumnsNames = this.objTableColumns.get(tableName)
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
      // Clean it
      showColumnsNames = totalColumnsNames.filter(n => showColumnsNames.indexOf(n) > -1)

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
      this.iConfig.columns = this.totalColumns.filter(obj => {
        return this.cleanedColumnsShow.show.indexOf(obj.prop) > -1
      })
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

      let tableName = this.config.name || this.$route.name + '_' + newURL(url).pathname
      // 替换url中的uuid，避免同一个类型接口生成多个key，localStorage中的数据无法共用.
      tableName = replaceAllUUID(tableName)

      this.objTableColumns.set(tableName, columns)

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
