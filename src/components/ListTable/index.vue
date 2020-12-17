<template>
  <div>
    <TableAction :table-url="iTableConfig.url" :search-table="search" :date-pick="handleDateChange" v-bind="headerActions" :selected-rows="selectedRows" :reload-table="reloadTable" />
    <IBox class="table-content">
      <AutoDataTable ref="dataTable" :config="iTableConfig" @selection-change="handleSelectionChange" v-on="$listeners" />
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
    hasCreateAction() {
      const hasLeftAction = this.headerActions.hasLeftActions
      if (hasLeftAction === false) {
        return false
      }
      const hasCreate = this.headerActions.hasCreate
      if (hasCreate === false) {
        return false
      }
      return true
    },
    hasCloneAction() {
      const hasClone = _.get(this.tableConfig, 'columnsMeta.actions.formatterArgs.hasClone', null)
      if (hasClone) {
        return true
      }
      if (this.hasCreateAction && hasClone == null) {
        return true
      }
      return false
    },
    iTableConfig() {
      const config = deepmerge(this.tableConfig, { extraQuery: this.extraQuery })
      this.$log.debug('Header actions', this.headerActions)
      _.set(config, 'columnsMeta.actions.formatterArgs.hasClone', this.hasCloneAction)
      this.$log.debug('ListTable: iTableConfig change', config)
      return config
    }
  },
  watch: {
    extraQuery: {
      handler() {
        this.$log.debug('ListTable: found extraQuery change')
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
      return this.dataTable.search(attrs, true)
    },
    handleDateChange(attrs) {
      this.$set(this.extraQuery, 'date_from', attrs[0].toISOString())
      this.$set(this.extraQuery, 'date_to', attrs[1].toISOString())
      // this.extraQuery = {
      //   date_from: attrs[0].toISOString(),
      //   date_to: attrs[1].toISOString()
      // }
      const query = {
        date_from: attrs[0].toISOString(),
        date_to: attrs[1].toISOString()
      }
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
