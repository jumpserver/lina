<template>
  <BackPlayground :title="$t('route.UserList')">
    <ListTables
      :tablebutton="$t('users.createUser')"
      tableroute="UserEdit"
      @SizeChange="handleSizeChange"
      @CurrentChange="handleCurrentChange"
    >
      <el-table
        v-loading="listLoading"
        :data="tableData"
        stripe
        border
        fit
        class="userTable"
      >
        <el-table-column
          type="selection"
          width="55"
          align="center"
          header-align="center"
        />
        <el-table-column
          :label="this.$t('common.name')"
          sortable
          align="center"
          header-align="center"
        >
          <template slot-scope="scope">
            <el-link type="success" size="small" style="font-size:14px" @click="handleDetail(scope.$index, scope.row)">{{ scope.row.name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column
          :label="this.$t('common.username')"
          prop="username"
          align="center"
          sortable
          header-align="center"
        />
        <el-table-column
          :label="this.$t('common.role')"
          prop="role_display"
          sortable
          align="center"
          header-align="center"
        />
        <el-table-column
          :label="this.$t('common.action')"
          align="center"
          header-align="center"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="handleEdit(scope.$index, scope.row)"
            >{{ $t('action.update') }}</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.$index, scope.row)"
            >{{ $t('action.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </ListTables>
  </BackPlayground>
</template>

<script>
import { ListTables, BackPlayground } from '@/layout/components'
import { getUserList } from '@/api/user'
import Tables from '@/layout/mixin/ListTables'
export default {
  components: {
    BackPlayground,
    ListTables
  },
  mixins: [Tables],
  data() {
    return {
      tableData: [],
      listLoading: true
    }
  },
  created() {
    this.getUsers(this.current_page, this.page_size, this.offset)
  },
  methods: {
    // 处理显示详情
    handleDetail: function(index, row) {
      this.$router.push({ name: 'UserDetail', params: { id: row.id }})
    },
    // 处理页面显示数量更新
    handleSizeChange(val) {
      this.offset = (this.current_page - 1) * val
      this.page_size = val
      this.getUsers(this.current_page, val, this.offset)
    },
    // 处理页码更新
    handleCurrentChange(val) {
      this.offset = (val - 1) * this.page_size
      this.current_page = val
      this.getUsers(val, this.page_size, this.offset)
    },
    // 获取数据详情
    getUsers(draw, limit, offset) {
      this.listLoading = true
      getUserList({ draw, limit, offset }).then(response => {
        this.tableData = response.results
        this.total = response.count
        this.listLoading = false
      })
    }
  }
}
</script>

<style lang="less" scoped>

</style>
