import { toSentenceCase } from '@/utils/common'
import i18n from '@/i18n/i18n'

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
import LabelsFormatter from '@/components/Table/TableFormatters/LabelsFormatter.vue'

export class TableColumnsGenerator {
  constructor(config, meta, vm) {
    this.config = config
    this.meta = meta
    this.vm = vm
  }

  dynamicActionWidth() {
    console.log(i18n.locale)
    if (i18n.locale === 'zh-hans' || i18n.locale === 'zh-hant') {
      return '100px'
    }

    if (i18n.locale === 'ja' || i18n.locale === 'ko') {
      return '120px'
    }

    return '160px'
  }

  generateColumns() {
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

    // columns = this.orderingColumns(columns)
    // 第一次初始化时记录 totalColumns
    config.columns = columns
    return columns
  }

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
  }

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
  }

  generateColumnByName(name, col) {
    switch (name) {
      case 'id':
        if (!col.width) {
          col.width = '299px'
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
          width: this.dynamicActionWidth(),
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
  }

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
  }

  setDefaultFormatterIfNeed(col) {
    const h = this.vm.$createElement
    if (!col.formatter) {
      col.formatter = (row, column, cellValue) => {
        let value = cellValue
        let padding = '0'
        const excludes = [undefined, null, '']
        if (excludes.indexOf(value) !== -1) {
          padding = '6px'
          value = '-'
        }
        return h('span', {
          'style': {
            marginLeft: padding
          }
        }, [value])
      }
    }
    return col
  }

  setDefaultWidthIfNeed(col) {
    const lang = i18n.locale
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
  }

  addOrderingIfNeed(col) {
    if (col.prop) {
      const column = this.meta[col.prop] || {}
      if (column.order) {
        col.sortable = 'custom'
        col['column-key'] = col.prop
      }
    }
    return col
  }

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
  }

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
  }
}
