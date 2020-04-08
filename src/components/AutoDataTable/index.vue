<template>
  <DataTable ref="dataTable" v-loading="loading" :config="totalConfig" v-bind="$attrs" v-on="$listeners"></DataTable>
</template>

<script>
import DataTable from '../DataTable'
import { DetailFormatter, DisplayFormatter, BooleanFormatter, ActionsFormatter } from '@/components/ListTable/formatters/index'
import { optionUrlMeta } from '@/api/common'
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
    this.optionUrlMeta()
    console.log('auto data form', this.$attrs)
  },
  methods: {
    optionUrlMeta() {
      console.log(this.config.url)
      const url = `${this.config.url}?draw=1&display=1`
      optionUrlMeta(url).then(data => {
        this.meta = data.actions[this.method.toUpperCase()] || {}
        this.generateColumns()
        this.loading = false
      }).catch(error => {
        console.log(error)
        this.loading = false
      })
    },
    generateColumn(name) {
      const colMeta = this.meta[name] || {}
      const customMeta = this.config.columnsMeta ? this.config.columnsMeta[name] : {}
      let col = { prop: name, label: colMeta.label }

      switch (name) {
        case 'name':
          col.formatter = DetailFormatter
          col.sortable = 'custom'
          col.route = this.config.detailRoute
          break
        case 'actions':
          col = {
            prop: 'id',
            label: this.$tc('Actions'),
            align: 'center',
            formatter: ActionsFormatter,
            width: '200px'
          }
          break
        case 'is_valid':
          col.label = this.$tc('Validity')
          col.formatter = BooleanFormatter
          col.align = 'center'
          col.width = '80px'
          break
        case 'comment':
          col.showOverflowTooltip = true
      }

      switch (colMeta.type) {
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
      if (colMeta.type === 'choice') {
        col.sortable = 'custom'
        col.formatter = DisplayFormatter
      }

      col = Object.assign(col, customMeta)
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
