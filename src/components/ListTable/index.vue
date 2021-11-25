<template>
  <div>
    <TableAction
      :table-url="tableUrl"
      :search-table="search"
      :date-pick="handleDateChange"
      :selected-rows="selectedRows"
      :reload-table="reloadTable"
      v-bind="headerActions"
    />
    <IBox class="table-content">
      <AutoDataTable
        ref="dataTable"
        :filter-table="filter"
        :config="iTableConfig"
        @selection-change="handleSelectionChange"
        v-on="$listeners"
      />
    </IBox>
  </div>
</template>

<script>
import AutoDataTable from '../AutoDataTable'
import IBox from '../IBox'
import TableAction from './TableAction'
import Emitter from '@/mixins/emitter'
import deepmerge from 'deepmerge'

export default {
  name: 'ListTable',
  components: {
    AutoDataTable,
    TableAction,
    IBox
  },
  mixins: [Emitter],
  props: {
    // 定义 table 的配置
    tableConfig: {
      type: Object,
      default: () => ({})
    },
    // 是否显示table左侧的action
    headerActions: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      selectedRows: [],
      init: false,
      extraQuery: {}
    }
  },
  computed: {
    dataTable() {
      return this.$refs.dataTable.$refs.dataTable
    },
    iTableConfig() {
      const config = deepmerge(this.tableConfig, { extraQuery: this.extraQuery })
      this.$log.debug('Header actions', this.headerActions)
      this.$log.debug('ListTable: iTableConfig change', config)
      return config
    },
    tableUrl() {
      return this.iTableConfig.url
    }
  },
  watch: {
    extraQuery: {
      handler() {
        this.$log.debug('ListTable: found extraQuery change')
      },
      deep: true
    },
    tableColConfig: {
      handler() {
        this.$log.debug('ListTable: found colConfig change')
      },
      deep: true
    }
  },
  methods: {
    handleSelectionChange(val) {
      this.selectedRows = val
    },
    reloadTable() {
      this.dataTable.getList()
    },
    search(attrs) {
      this.$emit('TagSearch', attrs)
      return this.dataTable.search(attrs, true)
    },
    filter(attrs) {
      this.$emit('TagFilter', attrs)
      this.$refs.dataTable.$refs.dataTable.search(attrs, true)
    },
    handleDateChange(attrs) {
      let dateFrom = ''
      let dateTo = ''
      try {
        dateFrom = attrs[0].toISOString()
        dateTo = attrs[1].toISOString()
      } catch (e) {
        this.$log.error('Handle date change error: ', attrs)
        dateFrom = new Date()
        dateFrom.setDate(dateFrom.getDate() - 5)
        dateFrom = dateFrom.toISOString()
        dateTo = new Date()
        dateTo.setDate(dateTo.getDate() + 1)
        dateTo = dateTo.toISOString()
      }
      this.$set(this.extraQuery, 'date_from', dateFrom)
      this.$set(this.extraQuery, 'date_to', dateTo)
      const query = {
        date_from: dateFrom,
        date_to: dateTo
      }
      this.$emit('TagDateChange', attrs)
      return this.dataTable.searchDate(query)
    },
    toggleRowSelection(row, isSelected) {
      return this.dataTable.toggleRowSelection(row, isSelected)
    }
  }
}
</script>

<style lang="scss" scoped>

.table-content {
  margin-top: 10px;

  & >>> .el-card__body {
    padding: 0;
  }
  & >>> .el-table__header thead > tr > th {
    background-color: white;
  }
}

//修改颜色
// .el-button--text{
//   color: #409EFF;
// }
</style>
