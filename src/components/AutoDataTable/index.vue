<template>
  <DataTable ref="dataTable" v-loading="loading" :config="totalConfig" v-bind="$attrs" v-on="$listeners" />
</template>

<script type="text/jsx">
import DataTable from '../DataTable'
import { DateFormatter, DetailFormatter, DisplayFormatter, BooleanFormatter, ActionsFormatter } from '@/components/ListTable/formatters'
export default {
  name: 'AutoDataTable',
  components: {
    DataTable
  },
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: true,
      method: 'get',
      totalConfig: {},
      meta: {}
    }
  },
  mounted() {
    this.optionUrlMetaAndGenCols()
  },
  methods: {
    optionUrlMetaAndGenCols() {
      const url = (this.config.url.indexOf('?') === -1) ? `${this.config.url}?draw=1&display=1` : `${this.config.url}&draw=1&display=1`
      this.$store.dispatch('common/getUrlMeta', { url: url }).then(data => {
        this.meta = data.actions[this.method.toUpperCase()] || {}
        this.generateColumns()
      }).catch((error) => {
        this.$log.error('Error occur: ', error)
        // this.totalConfig = this.config
      }).finally(() => {
        this.loading = false
      })
    },
    generateColumnByName(name, col) {
      switch (name) {
        case 'name':
          col.formatter = DetailFormatter
          col.sortable = 'custom'
          break
        case 'actions':
          col = {
            prop: 'id',
            label: this.$t('common.Actions'),
            align: 'center',
            width: '150px',
            formatter: ActionsFormatter,
            actions: this.config.actions || {}
          }
          break
        case 'is_valid':
          col.label = this.$t('common.Validity')
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
    generateColumn(name) {
      const colMeta = this.meta[name] || {}
      const customMeta = this.config.columnsMeta ? this.config.columnsMeta[name] : {}
      let col = { prop: name, label: colMeta.label }

      col = this.generateColumnByName(name, col)
      col = this.generateColumnByType(colMeta.type, col)
      col = Object.assign(col, customMeta)
      col = this.addHelpTipsIfNeed(col)
      return col
    },
    generateColumns() {
      const config = Object.assign({}, this.config)
      const columns = []
      for (let col of this.config.columns) {
        if (typeof col === 'object') {
          columns.push(col)
        } else if (typeof col === 'string') {
          col = this.generateColumn(col)
          columns.push(col)
        }
      }
      this.totalConfig = Object.assign(config, { columns: columns })
    }
  }
}
</script>

<style scoped>

</style>
