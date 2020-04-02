<template>
  <div>
    <TableAction v-bind="actionConfig" @clickAction="handleActionClick"></TableAction>
    <el-card class="table-content">
      <DataTable :config="tableConfig" @selection-change="handleSelectionChange"></DataTable>
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
      default: () => {}
    },
    // 是否显示table左侧的action
    actionConfig: {
      type: Object,
      default: () => ({ })
    }
  },
  data() {
    return {
      selectRows: []
    }
  },
  computed: {
  },
  methods: {
    handleSelectionChange(val) {
      this.selectRows = val
      this.multipleSelection = val;
      (val.length > 0) ? (this.selectDisable = false) : (this.selectDisable = true)
    },
    handleActionClick(item) {
      console.log('Handle ', item, this.selectRows)
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
