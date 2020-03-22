<template>
  <BackPlayground :title="$t('route.AdminUserList')">
    <ListTables
      :tablebotton="$t('assets.AdminUserCreate')"
      tableroute="UserEdit"
      @SizeChange="handleSizeChange"
      @CurrentChange="handleCurrentChange"
    >
      <el-table
        v-loading="listLoading"
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
          :label="this.$t('assets.name')"
          sortable
          align="center"
          header-align="center"
        >
          <template slot-scope="scope">
            <el-button type="text" size="small" style="font-size:14px" @click="handleDetail(scope.$index, scope.row)">{{ scope.row.name }}</el-button>
          </template>
        </el-table-column>
        <el-table-column
          :label="this.$t('assets.username')"
          sortable
          align="center"
          header-align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.username }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="this.$t('assets.asset')"
          align="center"
          header-align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.assets_amount }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="this.$t('assets.comment')"
          align="center"
          header-align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.comment }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="this.$t('assets.action')"
          align="center"
          header-align="center"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="handleEdit(scope.$index, scope.row)"
            >{{ $t('assets.update') }}</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.$index, scope.row)"
            >{{ $t('assets.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </ListTables>
  </BackPlayground>
</template>

<script>
import { ListTables, BackPlayground } from '@/layout/components'
import { getAdminUserList } from '@/api/asset'
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
    this.getAdminUser(this.current_page, this.page_size, this.offset)
  },
  methods: {
    handleDetail: function(index, row) {
      this.$router.push({ name: 'AdminUserDetail', params: { id: row.id }})
    },
    handleSizeChange(val) {
      // 当每页数量改变触发
      this.offset = (this.current_page - 1) * val
      this.page_size = val
      this.getAdminUser(this.current_page, val, this.offset)
    },
    handleCurrentChange(val) {
      // 当页码改变触发
      this.offset = (val - 1) * this.page_size
      this.current_page = val
      this.getAdminUser(val, this.page_size, this.offset)
    },
    getAdminUser(draw, limit, offset) {
      this.listLoading = true
      getAdminUserList({ draw, limit, offset }).then(response => {
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
