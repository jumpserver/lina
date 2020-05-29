<template>
  <div>
    <TableAction :table-url="iTableConfig.url" :search-table="search" :date-pick="handleDateChange" v-bind="headerActions" :selected-rows="selectedRows" :reload-table="reloadTable" />
    <IBox class="table-content">
      <AutoDataTable :key="iTableConfig.url" ref="dataTable" :config="iTableConfig" @selection-change="handleSelectionChange" v-on="$listeners" @update="handleDataChange" />
    </IBox>
  </div>
</template>

<script>
import AutoDataTable from '../AutoDataTable'
import IBox from '../IBox'
import TableAction from './TableAction'
import Emitter from '@/mixins/emitter'
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
      iTableConfig: {
        extraQuery: {
          date_from: '',
          date_to: ''
        },
        ...this.tableConfig
      }
    }
  },
  computed: {
    dataTable() {
      return this.$refs.dataTable.$refs.dataTable
    }
  },
  methods: {
    handleSelectionChange(val) {
      this.selectedRows = val
      const obj = {}
      val.forEach((item, index) => { obj[index] = item })
      // 已知Bug，必须避免数组扁平化
      this.dispatch('AssetSelect', 'SelectionChange', obj)
    },
    reloadTable() {
      this.dataTable.getList()
    },
    search(attrs) {
      return this.dataTable.search(attrs)
    },
    handleDateChange(attrs) {
      console.log(attrs)
      this.iTableConfig.extraQuery = {
        date_from: attrs[0],
        date_to: attrs[1]
      }
      return this.dataTable.searchDate({
        date_from: attrs[0],
        date_to: attrs[1]
      })
    },
    toggleRowSelection(row, isSelected) {
      return this.dataTable.toggleRowSelection(row, isSelected)
    },
    handleDataChange(val, res) {
      if (!this.init && this.tableConfig.defaultSelect !== undefined) {
        const obj = {}
        const arr = []
        for (let i = 0, len = val.length; i < len; i++) {
          if (this.tableConfig.defaultSelect.indexOf(val[i].id) > -1) {
            this.toggleRowSelection(val[i], true)
            arr.push(val[i])
          }
        }
        arr.forEach((item, index) => { obj[index] = item })
        this.dispatch('AssetSelect', 'SelectionChange', obj)
        this.init = false
      }
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

    /*& >>> .el-table--striped .el-table__body tr.el-table__row--striped td {*/
      /*background: white;*/
    /*}*/

    /*& >>> .el-table th, .el-table tr  {*/
      /*background-color: red;*/
      /*!*background-color: #FAFAFA;*!*/
    /*}*/
  }

  //修改颜色
  // .el-button--text{
  //   color: #409EFF;
  // }
</style>
