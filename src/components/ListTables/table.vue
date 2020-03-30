<template>
  <div>
    <div style="display:flex;flex-direction:row;justify-content:space-between;">
      <!--TODO: 事件交互 -->
      <headeraction v-if="hasHeader" class="actionHeader" :has-selection="hasSelect" :select-disable="selectDisable" style="display:flex;flex-direction:row;" @newClick="handleNewClick" @actionClick="handleActionClick" />
      <!-- TODO: 事件交互 -->
      <search v-if="hasSearch" class="search" @serachAction="handleSearch" />
      <slot name="header" />
    </div>
    <div class="table">
      <el-table
        v-loading="loading"
        :data="tabledata"
        @selection-change="handleSelectionChange"
        stripe
      >
        <el-table-column
          v-if="hasSelect"
          type="selection"
          :align="align"
          width="42px"
          :header-align="align"
        />
        <el-table-column
          v-for="col of columns"
          :key="col.props"
          :align="align"
          :label="col.label"
          :sortable="col.sortable"
          :header-align="align"
        >
          <template slot-scope="scope">
            <el-button v-if="col.link" type="text" size="small" style="font-size:14px" @click="$router.push({name: col.link, params: { id: scope.row.id }})">{{ scope.row[col.key] }}</el-button>
            <span v-else>{{ scope.row[col.key] }}</span>
          </template>
        </el-table-column>
        <slot name="status" />
        <el-table-column
          v-if="action !== []"
          :label="this.$t('usergroup.action')"
          :align="align"
          width="140px"
          :header-align="align"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="handleEdit(scope.$index, scope.row)"
            >{{ $t('usergroup.update') }}</el-button>
            <el-button
              size="mini"
              type="warning"
              @click="handleDelete(scope.$index, scope.row)"
            >{{ $t('usergroup.delete') }}</el-button>
          </template>
        </el-table-column>
        <slot name="extraAction" />
      </el-table>
      <el-pagination
        style="text-align:right;margin-top:20px;"
        :current-page="current_page"
        background
        :page-sizes="[10, 20, 50, 100]"
        :page-size="page_size"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import search from './search'
import headeraction from './headeraction'
const _vm = this
export default {
  name: 'Tables',
  components: {
    search,
    headeraction
  },
  props: {
    getData: {
      type: Function,
      default: () => []
    },
    align: {
      type: String,
      default: 'left'
    },
    hasSelect: {
      type: Boolean,
      default: false
    },
    columns: {
      type: Array,
      default: () => []
    },
    hasSearch: {
      type: Boolean,
      default: () => true
    },
    hasHeader: {
      type: Boolean,
      default: () => true
    },
    action: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      tabledata: [],
      loading: false,
      page_size: 10,
      current_page: 1,
      total: 0,
      offset: 0,
      headeractiontext: 'title',
      multipleSelection:[],
      selectDisable:true
    }
  },
  created() {
    this.get(this.current_page, this.page_size, this.offset)
  },
  methods: {
    handleSizeChange(val) {
      this.offset = (this.current_page - 1) * val
      this.page_size = val
      this.get(this.current_page, val, this.offset)
    },
    handleCurrentChange(val) {
      this.offset = (val - 1) * this.page_size
      this.current_page = val
      this.get(val, this.page_size, this.offset)
    },
    handleSearch(val) {
      this.loading = true
      this.getData({ search: val, draw: this.current_page, limit: this.page_size, offset: this.offset }, { row: 1 }).then(response => {
        console.log(response)
        this.tabledata = response.results
        this.total = response.count
        this.loading = false
      })
    },
    handleSelectionChange(val) {
        this.multipleSelection = val;
        (val.length>0) ? (this.selectDisable = false) : (this.selectDisable = true)
      },
    handleEdit: function(index, row) {
      try {
        this.$router.push({ name: this.action.hasEdit, params: { id: row.id }})
      } catch (error) {
        console.log(error)
      }
    },
    handleNewClick: function() {
      try {
        this.$router.push({ name: this.action.newClick, params: { id: 'create' }})
      } catch (error) {
        console.log(error)
      }
    },
    handleActionClick: function() {

    },
    handleDelete: function(index, row) {

    },
    get(draw, limit, offset) {
      this.loading = true
      this.getData({ draw, limit, offset }, { row: 1 }).then(response => {
        console.log(response)
        this.tabledata = response.results
        this.total = response.count
        this.loading = false
      })
    }

  }
}
</script>

<style lang="less" scoped>

.el-table /deep/ .el-table__row > td {
  padding: 0 !important;
}
.el-table /deep/ .el-table__row > td> div > span {
  text-overflow: ellipsis;
  -moz-text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.el-table /deep/ .el-table__header > thead > tr >th {
  padding:3px !important;
  background-color: #F5F5F6;
  font-size: 13px;
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
