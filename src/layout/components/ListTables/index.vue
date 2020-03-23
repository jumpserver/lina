<template>
  <div>
    <div class="tableTitle">
      <el-row class="tableTitle-menu">
        <el-col :span="2"><el-button size="small" type="primary" @click="$router.push({ name: tableroute, params:{id:'create'} })">{{ tablebutton }}</el-button></el-col>
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
      <slot />
    </div>
    <div class="block">
      <el-pagination
        background
        :current-page="currentPage"
        :page-sizes="[10, 25, 50, 100]"
        :page-size="pageSize"
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
  props: {
    tablebutton: {
      type: String,
      default: () => { return 'tablebutton' }
    },
    tableroute: {
      type: String,
      default: () => { return '404' }
    },
    pageSize: {
      type: Number,
      default: () => { return 10 }
    },
    currentPage: {
      type: Number,
      default: () => { return 1 }
    },
    offset: {
      type: Number,
      default: () => { return 0 }
    },
    total: {
      type: Number,
      default: () => { return 1 }
    }

  },
  data() {
    return {
    }
  },
  methods: {
    handleSizeChange(val) {
      this.$emit('SizeChange', val)
    },
    handleCurrentChange(val) {
      this.$emit('CurrentChange', val)
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
.tableTitle{
  padding-bottom:1%;
  .tableTitle-menu{
    padding-top:15px;
  }
}
.block{
  background-color: #fff;
  text-align: center;
  width: 98%;
  margin-left:1%;
  padding-bottom: 1%;
}
.el-table /deep/ td, .el-table /deep/ th {
  padding: 8px 0 !important;
  /*line-height: 1.42857;*/
  /*padding: 8px;*/
  /*vertical-align: top;*/
  /*border: 1px solid #e7e7e7;*/
}
</style>
