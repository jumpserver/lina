<template>
  <div>
    <!--面包屑导航-->
    <div class="userTitle">
      <div class="userTitle-context">
        {{ $t('users.usergrouplist') }}
      </div>
      <el-row class="userTitle-menu">
        <el-col :span="2"><el-button size="small" type="primary" @click="$router.push({ name: 'userGroupCreate' })">{{ $t('users.createusergroup') }}</el-button></el-col>
        <el-col :span="3" :offset="17">
          <el-input
            size="small"
            :placeholder="this.$t('users.search')"
          >
            <i slot="prefix" class="el-input__icon el-icon-search" />
          </el-input>
        </el-col>
        <el-col :span="1" style="margin-left:6px;">
          <el-dropdown>
            <el-button size="small" type="default">
              CSV<i class="el-icon-arrow-down el-icon--right" />
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>导入</el-dropdown-item>
              <el-dropdown-item>导出</el-dropdown-item>
              <el-dropdown-item>更新</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
      </el-row>
    </div>
    <div class="userTableBasic">
      <el-table
        :data="tableData"
        stripe
        border
        class="userTable"
      >
        <el-table-column
          type="selection"
          width="55"
          align="center"
          header-align="center"
        />
        <el-table-column
          :label="this.$t('usergroup.name')"
          sortable
          align="center"
          header-align="center"
        >
          <template slot-scope="scope">
            <el-button type="text" size="small" style="font-size:14px" @click="handleDetail(scope.$index, scope.row)">{{ scope.row.name }}</el-button>
          </template>
        </el-table-column>
        <el-table-column
          :label="this.$t('usergroup.user')"
          align="center"
          header-align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.users_amount }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="this.$t('usergroup.comment')"
          align="center"
          sortable
          header-align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.comment }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="this.$t('usergroup.action')"
          align="center"
          header-align="center"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="handleEdit(scope.$index, scope.row)"
            >{{ $t('usergroup.update') }}</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.$index, scope.row)"
            >{{ $t('usergroup.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="block">
      <el-pagination
        background
        :current-page="current_page"
        :page-sizes="[10, 25, 50, 100]"
        :page-size="page_size"
        layout="sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tableData: [{
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1517 弄'
      }, {
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1519 弄'
      }, {
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1516 弄'
      }]
    }
  }
}
</script>

<style lang="less" scoped>
//重置面包屑字体大小
.el-breadcrumb {
  padding: 20px;
  background-color: #fff;
}
el-breadcrumb__item{
  font-size:13px !important;
}
.el-header{
  background-color: #ffffff;
  //border-bottom: 1px solid #e7eaec !important;
}
.userTable{
  width: 96%;
  // margin-left:1%;
  margin-left: 2%;
}
.userTableBasic{
  width: 98%;
  margin-left:1%;
  padding-bottom:1%;
  background-color: #fff;
}
.userTitle{
  width: 98%;
  margin-left:1%;
  margin-top:1%;
  padding-bottom:1%;
  background-color: #fff;
  .userTitle-context{
    text-align: left;
    font-size: 14px;
    padding-top:15px;
    padding-left:15px;
    padding-bottom: 15px;
    font-weight: 600;
    border-bottom: 1px solid #e7eaec !important;
  }
  .userTitle-menu{
    padding-top:15px;
  }
}
.block{
  background-color: #fff;
  width: 98%;
  margin-left:1%;
  padding-bottom: 1%;
}
.el-table /deep/ td, .el-table /deep/ th {
  padding: 8px 0 !important;
}
</style>
