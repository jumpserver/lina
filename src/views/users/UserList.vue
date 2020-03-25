<template>
  <BackPlayground :title="$t('route.UserList')">
    <el-data-table v-bind="tableConfig" style="margin:0 12px 12px 12px;">
      <template v-slot:header="{selected}">
        <el-dropdown>
          <el-button type="primary" size="small" :disabled="selected.length>0?false:true">
            更多菜单<i class="el-icon-arrow-down el-icon--right" />
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>批量删除</el-dropdown-item>
            <el-dropdown-item>批量更新</el-dropdown-item>
            <el-dropdown-item>禁用所选</el-dropdown-item>
            <el-dropdown-item>激活所选</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </el-data-table>
  </BackPlayground>
</template>

<script>
import { BackPlayground } from '@/layout/components'
import Tables from '@/layout/mixin/ListTables'

export default {
  components: {
    BackPlayground
  },
  mixins: [Tables],
  data() {
    return {
      tableData: [],
      listLoading: true,
      tableConfig: {

        axiosConfig: {
          raw: 1
        },
        url: '/api/v1/users/users/',
        dataPath: 'results',
        totalPath: 'count',
        pageSizeKey: 'limit',
        pageKey: 'offset', // 数据偏移量
        saveQuery: false, // 关闭路径保存查询参数
        persistSelection: true, // 切换页面 已勾选项不会丢失
        hasEdit: false, // 有编辑按钮
        newText: '创建',
        firstPage: 0, // 初始页页码
        hasDelete: false,
        hasNew: true,
        // editText: this.$t('action.update'), // 编辑按钮文案
        tableAttrs: {
          stripe: true, // 斑马纹表格
          border: true, // 表格边框
          fit: true // 宽度自适应
        },
        extraButtons: [
          {
            type: 'primary',
            // disabled: row => row.date === '2016-05-04',
            text: this.$t('users.update'),
            // 必须使用箭头函数
            atClick: (row) => {
              this.$router.push({ name: '404' })
            }
          },
          {
            type: 'warning',
            // disabled: row => row.date === '2016-05-04',
            text: this.$t('users.delete'),
            atClick: (row) => {

            }
          }
        ],
        columns: [
          { type: 'selection' },
          // Bug
          // 应该让我插入Slot,使这个用户名可点击
          {
            prop: 'name',
            align: 'center',
            label: this.$t('users.name'),
            sortable: true // 可排序
          },
          {
            prop: 'username',
            label: this.$t('users.username'),
            sortable: true
          },
          {
            prop: 'role',
            label: this.$t('users.role'),
            sortable: true
          },
          // Bug API没有返回组织名称
          {
            prop: 'group',
            align: 'center',
            label: this.$t('users.usergroup'),
            sortable: true
          },
          {
            prop: 'source',
            align: 'center',
            label: this.$t('users.source'),
            sortable: true
          }
        ]
      }
    }
  },
  created() {
  },
  methods: {

  }
}
</script>

<style lang="less" scoped>
// 重制表单样式
.el-data-table /deep/ .el-pagination{
  text-align: center !important;
}
.el-data-table /deep/ .el-table td{
  padding: 4px 0;
}
.el-data-table /deep/ .el-table th{
  padding: 4px 0;
}
.el-data-table/deep/ .el-form-item{
  margin-bottom:10px !important ;
  margin-top:10px;
}
.el-data-table/deep/ .el-pagination{
  padding:15px  0 !important ;
}
</style>
