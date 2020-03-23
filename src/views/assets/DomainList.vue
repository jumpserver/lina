<template>
  <BackPlayground :title="$t('route.AdminUserList')">
    <ListTables
      :tablebutton="$t('assets.AdminUserCreate')"
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
          :label="this.$t('assets.asset')"
          align="center"
          header-align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.asset_count }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="this.$t('assets.gateway')"
          align="center"
          header-align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.gateway_count }}</span>
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
import { getDomainList } from '@/api/asset'
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
    this.getDomain(this.current_page, this.page_size, this.offset)
  },
  methods: {
    handleDetail: function(index, row) {
      this.$router.push({ name: 'DomainDetail', params: { id: row.id }})
    },
    handleSizeChange(val) {
      // 当每页数量改变触发
      this.offset = (this.current_page - 1) * val
      this.page_size = val
      this.getDomain(this.current_page, val, this.offset)
    },
    handleCurrentChange(val) {
      // 当页码改变触发
      this.offset = (val - 1) * this.page_size
      this.current_page = val
      this.getDomain(val, this.page_size, this.offset)
    },
    getDomain(draw, limit, offset) {
      this.listLoading = true
      getDomainList({ draw, limit, offset }).then(response => {
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
