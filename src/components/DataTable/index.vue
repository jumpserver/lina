<template>
  <ElDatableTable
    ref="table"
    class="el-data-table"
    v-bind="tableConfig"
    @sizeChange="handleSizeChange"
    @update="onUpdate"
    v-on="iListeners"
  />
</template>

<script>
import { default as ElDatableTable } from './compenents/el-data-table'
import { mapGetters } from 'vuex'

export default {
  name: 'DataTable',
  components: {
    ElDatableTable
  },
  props: {
    config: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    const userTableActions = this.config.tableActions || {}
    return {
      defaultConfig: {
        axiosConfig: {
          raw: 1,
          params: {
            display: 1,
            draw: 1
          }
        },
        extraQuery: {},
        defaultAlign: 'left',
        dataPath: 'results',
        totalPath: 'count',
        saveQuery: false, // 关闭路径保存查询参数
        persistSelection: true, // 切换页面 已勾选项不会丢失
        hasEdit: userTableActions.hasEdit !== false, // 有编辑按钮
        hasDelete: userTableActions.hasDelete !== false,
        hasNew: false,
        buttonSize: 'mini',
        tableAttrs: {
          stripe: false, // 斑马纹表格
          border: true, // 表格边框
          fit: true, // 宽度自适应,
          tooltipEffect: 'dark',
          rowClassName: ({ row }) => {
            const selected = this.dataTable.selected.find(item => item.id === row.id)
            return selected ? 'selected-row' : ''
          }
        },
        extraButtons: userTableActions.extraButtons,
        onEdit: (row) => {
          const defaultOnEdit = (row) => {
            const routeName = userTableActions.editRoute
            this.$router.push({ name: routeName, params: { id: row.id }})
          }
          let onEdit = userTableActions.onEdit
          if (!onEdit) {
            onEdit = defaultOnEdit
          }
          return onEdit(row)
        },
        pageCount: 5,
        paginationLayout: 'total, sizes, prev, pager, next',
        paginationSize: JSON.parse(localStorage.getItem('paginationSize')) || 15,
        paginationSizes: [15, 30, 50, 100],
        paginationBackground: true,
        transformQuery: query => {
          if (query.page && query.size) {
            const page = query.page > 0 ? query.page : 1
            const offset = (page - 1) * query.size
            const limit = query.size
            query.offset = offset
            query.limit = limit
            delete query['page']
            delete query['size']
          }
          if (query.sort) {
            let ordering = query.direction === 'descending' ? '-' : ''
            ordering += query.sort
            query.order = ordering
            delete query['sort']
            delete query['direction']
          }
          return query
        },
        theRowDefaultIsSelected: (row) => {
          return false
        }
      }
    }
  },
  computed: {
    iListeners() {
      const defaultListeners = {}
      return Object.assign(defaultListeners, this.$listeners, this.tableConfig?.listeners)
    },
    dataTable() {
      return this.$refs.table
    },
    tableConfig() {
      const tableDefaultConfig = this.defaultConfig
      let tableAttrs = tableDefaultConfig.tableAttrs
      if (this.config.tableAttrs) {
        tableAttrs = Object.assign(tableAttrs, this.config.tableAttrs)
      }
      const config = Object.assign(tableDefaultConfig, this.config)
      config.tableAttrs = tableAttrs
      this.$log.debug('elTableConfig', config)
      return config
    },
    ...mapGetters({
      'globalTableConfig': 'tableConfig'
    })
  },
  watch: {},
  methods: {
    getList() {
      this.$refs.table.clearSelection()
      return this.$refs.table.getList()
    },
    getData() {
      return this.$refs.table.data
    },
    searchDate(attrs) {
      return this.$refs.table.searchDate(attrs)
    },
    search(attrs, reset) {
      return this.$refs.table.search(attrs, reset)
    },
    getQuery() {
      return this.$refs.table.getQuery()
    },
    toggleRowSelection(row, isSelected) {
      return this.$refs.table.toggleRowSelection(row, isSelected)
    },
    onUpdate(data, response) {
      const theRowDefaultIsSelected = this.tableConfig.theRowDefaultIsSelected
      if (!theRowDefaultIsSelected || typeof theRowDefaultIsSelected !== 'function') {
        return
      }

      for (const row of data) {
        if (theRowDefaultIsSelected(row)) {
          this.toggleRowSelection(row, true)
        }
      }
    },
    handleSizeChange(val) {
      localStorage.setItem('paginationSize', val)
      this.$store.commit('table/SET_TABLE_CONFIG',
        {
          key: 'paginationSize',
          value: val
        }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
