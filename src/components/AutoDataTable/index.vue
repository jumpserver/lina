<template>
  <DataTable v-if="!loading" ref="dataTable" v-loading="loading" :config="iConfig" v-bind="$attrs" v-on="$listeners" />
</template>

<script type="text/jsx">
import DataTable from '../DataTable'
import { DateFormatter, DetailFormatter, DisplayFormatter, BooleanFormatter, ActionsFormatter } from '@/components/ListTable/formatters'
import i18n from '@/i18n/i18n'
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
      autoConfig: {},
      iConfig: {},
      meta: {}
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
      config.columns = columns
      this.iConfig = config
    }
  }
}
</script>

<style scoped>

</style>
