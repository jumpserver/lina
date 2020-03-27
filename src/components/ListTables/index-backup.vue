<template>
  <div>
    <div class="tableTitle">
      <div class="tableTitle-menu">
        <el-button size="small" type="primary" style="margin-left:12px;" @click="$router.push({ name: tableroute, params:{id:'create'} })">{{ tablebutton }}</el-button>
        <el-select v-model="value" size="small" placeholder="更多操作" style="margin-left:8px">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            :disabled="item.disabled"
          />
        </el-select>
        <el-dropdown style="float:right;margin-right:12px;margin-left:8px;">
          <el-button size="small" type="default">
            CSV<i class="el-icon-arrow-down el-icon--right" />
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>导入</el-dropdown-item>
            <el-dropdown-item>导出</el-dropdown-item>
            <el-dropdown-item>更新</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <!-- bug 待修复 -->
        <div style="display:inline-block;float:right">
          <el-input v-model="input3" placeholder="请输入内容" class="input-with-select" size="small">
            <el-select slot="prepend" v-model="select" placeholder="请选择">
              <el-option label="餐厅名" value="1" />
              <el-option label="订单号" value="2" />
              <el-option label="用户电话" value="3" />
            </el-select>
            <i slot="prefix" class="el-input__icon el-icon-search" />
          </el-input>
        </div>
      </div>
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
      select: '',
      input3: '',
      options: [{
        value: '1',
        label: '批量删除'
      }, {
        value: '2',
        disabled: true,
        label: '批量更新'

      }, {
        value: '3',
        label: '禁用所选'
      }, {
        value: '4',
        label: '激活所选'
      }],
      value: ''
    }
  },
  methods: {
    handleSizeChange(val) {
      this.$emit('SizeChange', val)
    },
    handleCurrentChange(val) {
      this.$emit('CurrentChange', val)
    },
    MutiSelectAction(val) {
      this.$emit('MutiSelectChange', val)
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
.el-input{
  width:inherit;
}
.el-breadcrumb__item{
  font-size:13px !important;
}
.el-header{
  background-color: #ffffff;
  //border-bottom: 1px solid #e7eaec !important;
}
.userTable{
  // margin-left:1%;
}
.userTableBasic{
  margin-right:12px;
  margin-left:12px;
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
