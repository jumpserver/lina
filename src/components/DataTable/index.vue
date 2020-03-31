<template>
  <ElDatableTable class="el-table" v-bind="tableConfig"></ElDatableTable>
</template>

<script>
import { default as ElDatableTable } from './compenents/el-data-table'

export default {
  name: 'DataTable',
  components: {
    ElDatableTable
  },
  props: {
    config: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      defaultConfig: {
        axiosConfig: {
          raw: 1,
          params: {
            display: 1
          }
        },
        dataPath: 'results',
        totalPath: 'count',
        saveQuery: false, // 关闭路径保存查询参数
        persistSelection: true, // 切换页面 已勾选项不会丢失
        hasEdit: false, // 有编辑按钮
        hasDelete: false,
        hasAction: false, // 是否有更多操作
        hasUpload: false,
        hasNew: false,
        // editText: this.$t('action.update'), // 编辑按钮文案
        tableAttrs: {
          stripe: true, // 斑马纹表格
          border: true, // 表格边框
          fit: true // 宽度自适应
        },
        pageCount: 5,
        paginationLayout: 'total, sizes, prev, pager, next',
        transformQuery: query => {
          if (query.page && query.size) {
            const page = query.page || 1
            const offset = (page - 1) * query.size
            const limit = query.size
            query.offset = offset
            query.limit = limit
            delete query['page']
            delete query['size']
          }
          return query
        }
      }
    }
  },
  computed: {
    tableConfig() {
      const config = Object.assign(this.defaultConfig, this.config)
      return config
    }
  }
}
</script>

<style lang="less" scoped>

  .el-table /deep/ .el-table__row > td {
    line-height: 1.5;
    padding: 8px;
  }
  .el-table /deep/ .el-table__row > td> div > span {
    text-overflow: ellipsis;
    -moz-text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
  .el-table /deep/ .el-table__header > thead > tr >th {
    padding: 8px;
    background-color: #F5F5F6;
    font-size: 13px;
    line-height: 1.5;
  }
  .table{
    margin-top: 15px;
  }

  //分页
  .el-pagination /deep/ .el-pagination__total{
    float: left;
  }

  .el-pagination /deep/ .el-pagination__sizes{
    float: left;
  }
  //修改颜色
  // .el-button--text{
  //   color: #409EFF;
  // }
</style>
