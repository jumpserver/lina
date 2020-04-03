<template>
  <div>
    <TableAction v-bind="headerActions" @clickAction="handleActionClick"></TableAction>
    <el-card class="table-content" shadow="never">
      <DataTable :config="tableConfig" @selection-change="handleSelectionChange">
        <template v-slot:actions="row">
          {{ row.id }}
        </template>
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
      selectRows: [],
    }
  },
  computed: {
    actionColumn() {
      const actions = []
      let tc = this.tableConfig
      if (tc.hasEdit !== false) {
        actions.push({
          name: 'update',
          title: this.$tc('Update')
        })
      }

      if (tc.hasDelete !== false) {
        actions.push({
          name: 'delete',
          title: this.$tc('Delete')
        })
      }
    }
  },
  methods: {
    handleSelectionChange(val) {
      this.selectRows = val
      this.multipleSelection = val;
      (val.length > 0) ? (this.selectDisable = false) : (this.selectDisable = true)
    },
    handleActionClick(item) {
      const handler = this.getActionHandler(item)
      handler(this.selectRows)
    },
    handleActionCreate() {
      const routeName = this.headerActions.createRoute || ''
      this.$router.push({ name: routeName })
      console.log('handle create')
    },
    getActionHandler(item) {
      let handler = this.headerActions.item
      const defaultHandlerName = 'handle' + item[0].toUpperCase() + item.slice(1, item.length)
      if (!handler) {
        handler = this[defaultHandlerName]
      }
      if (!handler) {
        handler = () => {
          console.log('No handler found for ', item)
        }
      }
      console.log(handler)
      return handler
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
