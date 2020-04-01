<template>
  <div>
    <TableAction></TableAction>
    <el-card class="table-content">
      <DataTable :config="tableConfig" @selection-change="handleSelectionChange" ></DataTable>
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

    createTitle: {
      type: String,
      default() {
        return this.$tc('Create')
      }
    },
    createAction: {
      type: Object,
      default() {
        return {
          type: 'primary',
          name: 'create',
          title: this.createTitle
        }
      }
    },
    moreActions: {
      type: Array,
      default: () => []
    },
    actions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectRows: []
    }
  },
  computed: {
    totalActions() {
      let actions = this.actions
      if (this.hasCreate) {
        actions = [
          this.createAction,
          ... actions
        ]
      }
      return actions
    }
  },
  methods: {
    handleSelectionChange(val) {
      console.log('lIst table', val)
      this.selectRows = val
      this.multipleSelection = val;
      (val.length > 0) ? (this.selectDisable = false) : (this.selectDisable = true)
    },
    handleEdit: function (index, row) {
      try {
        this.$router.push({name: this.action.hasEdit, params: {id: row.id}})
      } catch (error) {
        console.log(error)
      }
    },
    handleHeaderActionClick(item) {
      this.$emit('headerActionClick', item, this.selectRows)
    },
    handleDelete: (index, row) => {
    },
    get(draw, limit, offset) {
      this.loading = true
      // this.getData({ draw, limit, offset }, { row: 1 }).then(response => {
      //   console.log(response)
      //   this.tabledata = response.results
      //   this.total = response.count
      //   this.loading = false
      // })
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
