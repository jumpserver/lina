<template>
  <div>
    <TableAction :table-url="tableConfig.url" :search-table="search" v-bind="headerActions" :selected-rows="selectedRows" :reload-table="reloadTable"></TableAction>
    <el-card class="table-content" shadow="never">
      <DataTable ref="dataTable" :config="tableConfig" @selection-change="handleSelectionChange">
      </DataTable>
    </el-card>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import DataTable from '../DataTable'
import TableAction from './TableAction'

export default {
  name: 'ListTable',
  components: {
    DataTable,
    TableAction
  },
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
      selectedRows: []
    }
  },
  computed: {
    hasSelected() {
      return this.selectedRows.length > 0
    }
  },
  methods: {
    handleSelectionChange(val) {
      this.selectedRows = val
      console.log(this.selectedRows)
    },
    reloadTable() {
      this.$refs.dataTable.getList()
    },
    search(attrs) {
      return this.$refs.dataTable.search(attrs)
    }
  }
}
</script>

<style lang="less" scoped>

  .table-content {
    margin-top: 10px;
  }
  //修改颜色
  // .el-button--text{
  //   color: #409EFF;
  // }
</style>
