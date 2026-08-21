import i18n from '@/i18n/i18n'
import { h } from 'vue'
import { toSentenceCase } from '@/utils/common/index'

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
import { getDisplayValue } from '@/components/Table/TableFormatters/displayValue'

const textDisplayWidthCache = new Map()
const primaryColumnNames = ['id', 'name']
const compactColumnWidth = {
  min: 120,
  max: 180
}
const defaultActionColumnWidth = '110px'
const expandColumnWidth = '48px'
const indexColumnWidth = '80px'

function getColumnName(column) {
  return typeof column === 'object' ? column?.prop : column
}

export function orderActionColumn(columns, position = 'end') {
  const actionColumn = columns.find((column) => getColumnName(column) === 'actions')
  if (!actionColumn) {
    return columns
  }

  const otherColumns = columns.filter((column) => column !== actionColumn)
  return position === 'start' ? [actionColumn, ...otherColumns] : [...otherColumns, actionColumn]
}

function getOverflowTooltipOptions() {
  return {
    popperStyle: {
      maxWidth: 'min(500px, calc(100vw - 32px))',
      overflowWrap: 'anywhere',
      whiteSpace: 'normal',
      wordBreak: 'break-word'
    }
  }
}

export function orderPrimaryColumns(columns) {
  const getColumnName = (column) => (typeof column === 'object' ? column?.prop : column)
  return [
    ...primaryColumnNames.flatMap((name) =>
      columns.filter((column) => getColumnName(column) === name)
    ),
    ...columns.filter((column) => !primaryColumnNames.includes(getColumnName(column)))
  ]
}

export function getTextDisplayWidth(value) {
  const text = String(value ?? '')
  const cachedWidth = textDisplayWidthCache.get(text)
  if (cachedWidth !== undefined) {
    return cachedWidth
  }

  const width = Array.from(text).reduce((total, char) => {
    return total + (/[^\u0000-\u00ff]/.test(char) ? 13 : 7)
  }, 0)
  if (textDisplayWidthCache.size >= 2000) {
    textDisplayWidthCache.clear()
  }
  textDisplayWidthCache.set(text, width)
  return width
}

export function getColumnHeaderWidth(col) {
  if (!col?.label) {
    return 0
  }
  return Math.ceil(getTextDisplayWidth(col.label) + 100)
}

export function getBooleanColumnWidth(col) {
  const cellHorizontalPadding = 29
  const filterWidth = col?.filters?.length ? 18 : 0
  const sortWidth = col?.sortable ? 24 : 0
  const helpTipWidth = col?.helpTip ? 18 : 0
  const pinWidth = 32
  const extraSpacing = 10
  return Math.min(
    compactColumnWidth.max,
    Math.max(
      compactColumnWidth.min,
      Math.ceil(
        getTextDisplayWidth(col?.label) +
          cellHorizontalPadding +
          filterWidth +
          sortWidth +
          helpTipWidth +
          pinWidth +
          extraSpacing
      )
    )
  )
}

export function isAmountColumn(col) {
  const formatterName = col?.formatter?.name || col?.formatter?.__name || ''
  return (
    formatterName === 'AmountFormatter' || /(?:^|[._])(amount|count)$/.test(String(col?.prop || ''))
  )
}

export function getAmountColumnWidth(col) {
  return Math.min(
    compactColumnWidth.max,
    Math.max(compactColumnWidth.min, getColumnHeaderWidth(col))
  )
}

export class TableColumnsGenerator {
  constructor(config, meta, vm) {
    this.config = config
    this.meta = meta
    this.vm = vm
  }

  // dynamicActionWidth() {
  //   console.log(i18n.locale)
  //   if (i18n.locale === 'zh-hans' || i18n.locale === 'zh-hant') {
  //     return '100px'
  //   }

  //   if (i18n.locale === 'ja' || i18n.locale === 'ko') {
  //     return '120px'
  //   }

  //   return '160px'
  // }

  generateColumns() {
    const config = { ...this.config }
    let columns = []
    const allColumnNames = Object.entries(this.meta)
      .filter(([name, meta]) => !meta['write_only'])
      .map(([name, meta]) => name)
      .concat(config.columnsExtra || [])

    let configColumns = config.columns || allColumnNames
    const columnsExclude = config.columnsExclude || []
    const columnsAdd = config.columnsAdd || []
    const configuredColumnNames = new Set(
      configColumns.map((column) => (typeof column === 'object' ? column?.prop : column))
    )
    const primaryColumns = primaryColumnNames.filter(
      (name) => this.meta[name] && !this.meta[name].write_only && !configuredColumnNames.has(name)
    )
    configColumns = primaryColumns.concat(configColumns, columnsAdd)
    configColumns = configColumns.filter((item) => !columnsExclude.includes(item))

    // 解决后端 API 返回字段中包含 actions 的问题;
    const hasColumnActions = configColumns.findIndex((item) => item?.prop === 'actions') !== -1
    if (!hasColumnActions) {
      configColumns = [...configColumns.filter((i) => i !== 'actions'), 'actions']
    }
    configColumns = orderActionColumn(
      orderPrimaryColumns(configColumns),
      config.actionsColumnPosition
    )

    for (let col of configColumns) {
      if (typeof col === 'object') {
        columns.push(this.prepareAdaptiveColumn({ ...col }))
      } else if (typeof col === 'string') {
        col = this.generateColumn(col)
        columns.push(col)
      }
    }

    columns = columns.filter((item) => {
      if (item?.showFullContent) {
        item.className = this.appendClassName(item.className, 'show-full-content')
      }
      let has = item.has
      if (has === undefined) {
        has = true
      } else if (typeof has === 'function') {
        has = has()
      }
      return has
    })

    return columns
  }

  updateLabelIfNeed(col) {
    if (!col.label) {
      return col
    }
    col.label = col.label.replace(' Amount', '').replace(' amount', '').replace('数量', '')
    if (col.label.startsWith('Is ')) {
      col.label = col.label.replace('Is ', '')
    }
    col.label = toSentenceCase(col.label)
    return col
  }

  generateColumn(name) {
    const colMeta = this.meta[name] || {}
    const customMeta = this.config.columnsMeta ? this.config.columnsMeta[name] : {}
    let col = { prop: name, label: colMeta.label }

    col = this.generateColumnByType(colMeta.type, col, colMeta)
    col = this.generateColumnByName(name, col)
    col = this.setDefaultFormatterIfNeed(col)
    col = Object.assign(col, customMeta)
    col = this.addHelpTipIfNeed(col)
    col = this.addFilterIfNeed(col)
    col = this.addOrderingIfNeed(col)
    col = this.updateLabelIfNeed(col)
    col = this.prepareAdaptiveColumn(col)
    return col
  }

  generateColumnByName(name, col) {
    switch (name) {
      case 'id':
        if (!col.formatter) {
          col.formatter = CopyableFormatter
          col.iconPosition = 'left'
        }
        break
      case 'name':
        col.formatter = DetailFormatter
        col.sortable = 'custom'
        break
      case 'actions':
        col = {
          prop: 'actions',
          label: i18n.t('Actions'),
          align: 'center',
          headerAlign: 'center',
          width: defaultActionColumnWidth,
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
        break
      case 'is_active':
        col.formatter = ChoicesFormatter
        col.formatterArgs = {
          textChoices: {
            true: i18n.t('Active'),
            false: i18n.t('Inactive')
          }
        }
        break
      case 'datetime':
      case 'date_start':
        col.formatter = DateFormatter
        break
      case 'labels':
        col.formatter = LabelsFormatter
        break
      case 'comment':
        col.contentMaxWidth = 300
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
        break
      case 'datetime':
        col.formatter = DateFormatter
        break
      case 'object_related_field':
        col.formatter = ObjectRelatedFormatter
        break
      case 'm2m_related_field':
        col.formatter = ObjectRelatedFormatter
        break
      case 'nested object':
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
    if (!col.formatter) {
      col.formatter = (row, column, cellValue) => {
        let value = getDisplayValue(cellValue)
        let padding = '0'
        const excludes = [undefined, null, '']
        if (excludes.indexOf(value) !== -1) {
          padding = '6px'
          value = '-'
        }
        return h(
          'span',
          {
            style: {
              marginLeft: padding
            }
          },
          [value]
        )
      }
    }
    return col
  }

  setDefaultWidthIfNeed(col) {
    if (!col || !col.label) {
      return col
    }

    const formatterName = col.formatter?.name || col.formatter?.__name || ''
    let typeWidth = 180
    if (col.contentMaxWidth) {
      typeWidth = col.contentMaxWidth
    } else if (col.prop === 'name') {
      typeWidth = 260
    } else if (col.prop === 'platform' || formatterName === 'PlatformFormatter') {
      typeWidth = 220
    } else if (formatterName === 'DateFormatter') {
      typeWidth = 190
    } else if (col.prop === 'labels' || col.prop === 'protocols' || col.isCustomRender) {
      typeWidth = 280
    }

    const preferredWidth = Math.max(getColumnHeaderWidth(col), typeWidth)
    const preferredWidthPx = `${preferredWidth}px`

    const configuredWidth = col.width ?? col.minWidth
    const configuredPixels =
      typeof configuredWidth === 'number'
        ? configuredWidth
        : Number.parseFloat(String(configuredWidth || '').replace(/px$/, ''))
    const isPixelWidth =
      typeof configuredWidth === 'number' || /^\d+(\.\d+)?px$/.test(String(configuredWidth))

    if (!configuredWidth || !isPixelWidth || configuredPixels < preferredWidth) {
      if (col.width) {
        col.width = preferredWidthPx
      } else {
        col.minWidth = preferredWidthPx
      }
    }
    return col
  }

  appendClassName(className, value) {
    return [className, value].filter(Boolean).join(' ')
  }

  prepareAdaptiveColumn(col) {
    if (!col || typeof col !== 'object') {
      return col
    }

    if (Array.isArray(col.columns)) {
      col.columns = col.columns.map((item) => this.prepareAdaptiveColumn({ ...item }))
    }

    if (col.prop === 'comment' && !col.contentMaxWidth) {
      col.contentMaxWidth = 300
    }

    if (col.contentMaxWidth) {
      if (col.showOverflowTooltip === undefined) {
        col.showOverflowTooltip = true
      }
      col.className = this.appendClassName(col.className, 'bounded-content-table-column')
    }

    if (col.prop === 'actions') {
      col.width = col.width || col.minWidth || defaultActionColumnWidth
      delete col.minWidth
      col.align = 'center'
      col.headerAlign = 'center'
      col.fixed = this.config.actionsColumnPosition === 'start' ? 'left' : 'right'
      col.fitWidth = false
      col.resizable = false
    }

    const fieldMeta = this.meta[col.prop] || {}
    const isBooleanChoice =
      Array.isArray(fieldMeta.choices) &&
      fieldMeta.choices.length > 0 &&
      fieldMeta.choices.every((item) => typeof item.value === 'boolean')
    const isBooleanField = fieldMeta.type === 'boolean' || isBooleanChoice
    const isIdField = col.prop === 'id' || String(col.prop || '').includes('_id')
    const isAmountField = isAmountColumn(col)
    const isExpandColumn = col.type === 'expand'
    const isIndexColumn = col.type === 'index'
    if (isExpandColumn) {
      const configuredWidth = col.width ?? col.minWidth
      col.width = configuredWidth || expandColumnWidth
      delete col.minWidth
      col.fitWidth = false
    } else if (isIndexColumn) {
      const configuredWidth = col.width ?? col.minWidth
      col.width = configuredWidth || indexColumnWidth
      delete col.minWidth
      col.fitWidth = false
    } else if (isBooleanField) {
      col.width = `${getBooleanColumnWidth(col)}px`
      delete col.minWidth
      col.fitWidth = false
    } else if (isAmountField) {
      const configuredWidth = col.width ?? col.minWidth
      col.width = configuredWidth || `${getAmountColumnWidth(col)}px`
      delete col.minWidth
      col.fitWidth = false
    } else if (isIdField) {
      col.width = '308px'
      delete col.minWidth
      col.fitWidth = false
    }

    const isCompactColumn =
      col.prop === 'actions' || col.type === 'selection' || isExpandColumn || isIndexColumn
    col.isCustomRender =
      col.isCustomRender ?? Boolean(col.formatter && typeof col.formatter !== 'function')
    if (!isCompactColumn && !isBooleanField && !isAmountField && !isIdField) {
      this.setDefaultWidthIfNeed(col)
    }

    if (!isCompactColumn && !col.contentMaxWidth) {
      let contentClass = 'overflow-content-table-column'
      if (col.prop === 'name') {
        if (col.showOverflowTooltip === undefined) {
          col.showOverflowTooltip = getOverflowTooltipOptions()
        }
      } else if (col.isCustomRender) {
        contentClass = 'custom-render-table-column'
      } else if (col.showFullContent) {
        contentClass = 'full-content-table-column'
      } else if (col.showOverflowTooltip === undefined) {
        col.showOverflowTooltip = getOverflowTooltipOptions()
      }
      col.className = this.appendClassName(col.className, contentClass)
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
    col.renderHeader = ({ column, $index }) => {
      return h('span', [
        column.label,
        h(
          'el-tooltip',
          {
            placement: 'bottom',
            effect: 'dark',
            openDelay: 500,
            popperClass: 'help-tips'
          },
          {
            content: () =>
              h('div', {
                innerHTML: window.$xss ? window.$xss.process(String(helpTip || '')) : helpTip
              }),
            default: () =>
              h('i', {
                class: 'fa fa-question-circle-o help-tip-icon',
                style: 'padding-left: 2px'
              })
          }
        )
      ])
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
        col.filters = column.choices.map((item) => {
          if (typeof item.value === 'boolean') {
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
