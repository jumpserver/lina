<template>
  <DataTable ref="dataTable" v-loading="loading" :config="totalConfig" v-bind="$attrs" v-on="$listeners" />
</template>

<script>
import DataTable from '@/components/DataTable'
import { DetailFormatter, DisplayFormatter, BooleanFormatter, ActionsFormatter } from '@/components/ListTable/formatters'
import { optionUrlMeta } from '@/api/common'
export default {
  name: 'TreeAutoDataTable',
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
  },
  methods: {
    optionUrlMeta() {
      const url = `${this.config.url}draw=1&display=1`
      optionUrlMeta(url).then(data => {
        this.meta = data.actions[this.method.toUpperCase()] || {}
        this.generateColumns()
      }).catch(() => {
        this.totalConfig = this.config
      }).finally(() => {
        this.loading = false
      })
    },
    generateColumnByName(name, col) {
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
            width: '150px',
            actions: this.config.actions || {}
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
    generateColumn(name) {
      const colMeta = this.meta[name] || {}
      const customMeta = this.config.columnsMeta ? this.config.columnsMeta[name] : {}
      let col = { prop: name, label: colMeta.label }

      col = this.generateColumnByName(name, col)
      col = this.generateColumnByType(colMeta.type, col)
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
