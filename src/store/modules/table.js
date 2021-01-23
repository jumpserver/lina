import Vue from 'vue'
import {
  ActionsFormatter,
  BooleanFormatter,
  DateFormatter,
  DetailFormatter,
  DisplayFormatter
} from '@/components/ListTable/formatters'
import i18n from '@/i18n/i18n'

function getTableConfigFromLS() {
  return localStorage.getItem('tableConfig') ? JSON.parse(localStorage.getItem('tableConfig')) : {}
}
function generateColumnByName(name, col) {
  switch (name) {
    case 'name':
      col.formatter = DetailFormatter
      col.sortable = 'custom'
      col.showOverflowTooltip = true
      break
    case 'actions':
      col = {
        prop: 'id',
        label: i18n.t('common.Actions'),
        align: 'center',
        width: '150px',
        formatter: ActionsFormatter,
        formatterArgs: {}
      }
      break
    case 'is_valid':
      col.label = i18n.t('common.Validity')
      col.formatter = BooleanFormatter
      col.align = 'center'
      col.width = '80px'
      break
    case 'datetime':
    case 'date_start':
      col.formatter = DateFormatter
      break
    case 'comment':
      col.showOverflowTooltip = true
  }
  return col
}
function generateColumnByType(type, col) {
  switch (type) {
    case 'choice':
      col.sortable = 'custom'
      col.formatter = DisplayFormatter
      break
    case 'boolean':
      col.formatter = BooleanFormatter
      col.align = 'center'
      col.width = '80px'
      break
    case 'datetime':
      col.formatter = DateFormatter
      col.width = '160px'
  }
  return col
}
function addHelpTipsIfNeed(col) {
  const helpTips = col.helpTips
  if (!helpTips) {
    return col
  }
  col.renderHeader = (h, { column, $index }) => {
    return (
      <span>{column.label}
        <el-tooltip placement='bottom' effect='light' popperClass='help-tips'>
          <div slot='content' domPropsInnerHTML={helpTips} />
          <el-button style='padding: 0'>
            <i class='fa fa-info-circle' />
          </el-button>
        </el-tooltip>
      </span>
    )
  }
  return col
}
function addFilterIfNeed(col, meta) {
  if (col.prop) {
    const column = meta[col.prop] || {}
    if (!column.filter) {
      return col
    }
    if (column.type === 'boolean') {
      col.filters = [
        { text: this.$t('common.Yes'), value: true },
        { text: this.$t('common.No'), value: false }
      ]
      col.sortable = false
      col['column-key'] = col.prop
    }
    if (column.type === 'choice' && column.choices) {
      col.filters = column.choices.map(item => {
        if (typeof (item.value) === 'boolean') {
          if (item.value) {
            return { text: item.display_name, value: 'True' }
          } else {
            return { text: item.display_name, value: 'False' }
          }
        }
        return { text: item.display_name, value: item.value }
      })
      col.sortable = false
      col['column-key'] = col.prop
    }
  }
  return col
}
function generateColumns(CONFIG, META) {
  const config = _.cloneDeep(CONFIG)
  console.log(config, 'configCloneDeep')
  const columns = []

  for (let col of config.columns) {
    if (typeof col === 'object') {
      columns.push(col)
    } else if (typeof col === 'string') {
      col = generateColumn(col, CONFIG, META)
      columns.push(col)
    }
  }
  config.totalColumns = columns
  // 生成一个总渲染列表
  const totalColumnsList = []
  columns.forEach((v, k) =>
    totalColumnsList.push({
      prop: v.prop,
      label: v.label
    })
  )
  config.totalColumnsList = totalColumnsList

  return generateColumnsDisplayStatus(config)
}
function generateColumn(name, CONFIG, META) {
  const colMeta = META[name] || {}
  const customMeta = CONFIG.columnsMeta ? CONFIG.columnsMeta[name] : {}
  let col = { prop: name, label: colMeta.label }
  col = generateColumnByName(name, col)
  col = generateColumnByType(colMeta.type, col)
  col = Object.assign(col, customMeta)
  col = addHelpTipsIfNeed(col)
  col = addFilterIfNeed(col, META)
  return col
}

function generateCurrentColumns(config) {
  // 计算应该展示哪些Columns
  const currentColumns = []
  config.totalColumns.forEach((v, k) => {
    if (config.currentColumns.indexOf(v.prop) !== -1 ||
      v.prop === 'id') {
      currentColumns.push(config.totalColumns[k])
    }
  })
  config.columns = currentColumns

  return config
}

function generateColumnsDisplayStatus(config) {
  // 设置默认展示的Columns
  if (!config.defaultColumns) {
    const defaultColumns = []
    config.totalColumns.forEach((v, k) => {
      defaultColumns.push(v.prop)
    })
    config.defaultColumns = defaultColumns
  }
  // 设置当前展示的Columns
  if (!config.currentColumns) {
    config.currentColumns = config.defaultColumns
  }

  return generateCurrentColumns(config)
}

const state = {
  tableConfig: getTableConfigFromLS()
}

const mutations = {
  SET_TABLE_CONFIG: (state, tableConfig) => {
    // LocalStorage 无法存储Formatter信息
    Vue.set(state.tableConfig, tableConfig.key, tableConfig.value)
    const data = getTableConfigFromLS()
    data[tableConfig.key] = {
      currentColumns: tableConfig.value['currentColumns']
    }
    localStorage.setItem('tableConfig', JSON.stringify(data))
  },
  SET_PAGE_SIZE: (state, pageSize) => {
    Vue.set(state.tableConfig, 'paginationSize', pageSize)
    const data = getTableConfigFromLS()
    data['paginationSize'] = pageSize
    localStorage.setItem('tableConfig', JSON.stringify(data))
  }
}

const actions = {
  async generateTableConfig({ commit, state, dispatch }, { config, name }) {
    const url = config.url
    const iConfig = state.tableConfig[name]
    // 取最新的currentColumns
    if (iConfig) {
      config.currentColumns = iConfig.currentColumns
    }
    const tableUrl = (url.indexOf('?') === -1) ? `${url}?draw=1&display=1` : `${url}&draw=1&display=1`
    const method = 'get'
    const data = await dispatch('common/getUrlMeta', { url: tableUrl }, { root: true })
    const meta = data.actions[method.toUpperCase()] || {}

    const Config = generateColumns(config, meta)
    commit('SET_TABLE_CONFIG', {
      key: name,
      value: Config
    }
    )
    return Config
  },
  setCurrentColumns({ state, commit }, { name, currentColumns }) {
    let config = _.get(state.tableConfig, name, {})
    config.currentColumns = currentColumns
    config = generateCurrentColumns(config)
    commit('SET_TABLE_CONFIG', {
      key: name,
      value: config
    }
    )
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
