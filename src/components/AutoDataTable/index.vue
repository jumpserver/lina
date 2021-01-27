<template>
  <div>
    <DataTable v-if="!loading" ref="dataTable" v-loading="loading" :config="iConfig" v-bind="$attrs" v-on="$listeners" @filter-change="filterChange" />
    <ColumnSettingPopover
      :current-columns="currentColumns"
      :total-columns-list="totalColumnsList"
      @columnsUpdate="handleColumnsChange"
    />
  </div>
</template>

<script type="text/jsx">
import DataTable from '../DataTable'
import { DateFormatter, DetailFormatter, DisplayFormatter, BooleanFormatter, ActionsFormatter } from '@/components/ListTable/formatters'
import i18n from '@/i18n/i18n'
import ColumnSettingPopover from './components/ColumnSettingPopover'
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
      totalColumns: [],
      currentColumns: [],
      defaultColumns: [],
      totalColumnsList: []
    }
  },
  computed: {
    tableConfig() {
      return sessionStorage.getItem('tableConfig')
        ? JSON.parse(sessionStorage.getItem('tableConfig'))
        : {}
    }
  },
  watch: {
    config: {
      handler(iNew) {
        this.optionUrlMetaAndGenCols()
        this.$log.debug('AutoDataTable Config change found')
      },
      deep: true
    }
  },
  created() {
    this.optionUrlMetaAndGenCols()
  },
  methods: {
    async optionUrlMetaAndGenCols() {
      const url = (this.config.url.indexOf('?') === -1) ? `${this.config.url}?draw=1&display=1` : `${this.config.url}&draw=1&display=1`
      this.$store.dispatch('common/getUrlMeta', { url: url }).then(data => {
        this.meta = data.actions[this.method.toUpperCase()] || {}
        this.generateColumns()
      }).then(() => {
        this.generateDefaultColumns()
      }).then(() => {
        this.generateCurrentColumns(this.currentColumns)
      }).catch((error) => {
        this.$log.error('Error occur: ', error)
      }).finally(() => {
        this.loading = false
      })
    },
    generateColumnByName(name, col) {
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
    },
    generateColumnByType(type, col) {
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
    },
    addHelpTipsIfNeed(col) {
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
    },
    addFilterIfNeed(col) {
      if (col.prop) {
        const column = this.meta[col.prop] || {}
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
    },
    generateColumn(name) {
      const colMeta = this.meta[name] || {}
      const customMeta = this.config.columnsMeta ? this.config.columnsMeta[name] : {}
      let col = { prop: name, label: colMeta.label }

      col = this.generateColumnByName(name, col)
      col = this.generateColumnByType(colMeta.type, col)
      col = Object.assign(col, customMeta)
      col = this.addHelpTipsIfNeed(col)
      col = this.addFilterIfNeed(col)
      return col
    },
    generateColumns() {
      const config = _.cloneDeep(this.config)
      const columns = []
      for (let col of config.columns) {
        if (typeof col === 'object') {
          columns.push(col)
        } else if (typeof col === 'string') {
          col = this.generateColumn(col)
          columns.push(col)
        }
      }
      // 第一次初始化时记录 totalColumns
      this.totalColumns = columns
      config.columns = columns
      this.iConfig = config
    },
    generateCurrentColumns(col) {
      const currentColumns = []
      this.totalColumns.forEach((v, k) => {
        if (col.indexOf(v.prop) !== -1 ||
          v.prop === 'id') {
          currentColumns.push(this.totalColumns[k])
        }
      })
      this.iConfig.columns = currentColumns
    },
    generateDefaultColumns() {
      let defaultColumns = []
      const totalColumnsList = []

      this.totalColumns.forEach((v, k) => {
        if (!this.iConfig.defaultColumns) {
          defaultColumns.push(v.prop)
        } else {
          defaultColumns = this.iConfig.defaultColumns
        }
        totalColumnsList.push({
          prop: v.prop,
          label: v.label
        })
      })
      this.defaultColumns = defaultColumns
      this.totalColumnsList = totalColumnsList
      this.currentColumns = _.get(this.tableConfig[this.$route.name], 'currentColumns', this.defaultColumns)
    },
    handleColumnsChange(val) {
      this.currentColumns = val
      this.tableConfig[this.$route.name] = {
        'currentColumns': val
      }
      sessionStorage.setItem('tableConfig', JSON.stringify(this.tableConfig))
      this.generateCurrentColumns(val)
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

<style scoped>

</style>
