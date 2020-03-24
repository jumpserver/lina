<template>
  <BackPlayground :title="$t('route.Applications')">
    <ListTables
      :tablebutton="$t('applications.RemoteAppList')"
      tableroute=""
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
          :label="this.$t('applications.name')"
          sortable
          align="center"
          header-align="center"
        >
          <template slot-scope="scope">
            <el-button type="text" size="small" style="font-size:14px" @click="handleDetail(scope.$index, scope.row)">{{ scope.row.name }}</el-button>
          </template>
        </el-table-column>
        <el-table-column
          :label="this.$t('applications.app_type')"
          sortable
          align="center"
          header-align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.get_type_display }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="this.$t('applications.asset')"
          sortable
          align="center"
          header-align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.asset_info.hostname }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="this.$t('applications.comment')"
          sortable
          align="center"
          header-align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.comment }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="this.$t('applications.action')"
          align="center"
          header-align="center"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="handleEdit(scope.$index, scope.row)"
            >{{ $t('applications.update') }}</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.$index, scope.row)"
            >{{ $t('applications.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </ListTables>
  </BackPlayground>
</template>

<script>
import { ListTables, BackPlayground } from '@/layout/components'
import { getRemoteAppList } from '@/api/applications'
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
    this.getRemoteApp(this.current_page, this.page_size, this.offset)
  },
  methods: {
    handleDetail: function(index, row) {
      this.$router.push({ name: 'RemoteAppDetail', params: { id: row.id }})
    },
    handleEdit: function(index, row) {
      this.$router.push({ name: 'RemoteAppEdit', params: { id: row.id }})
    },
    handleDelete: function(index, row) {
    },
    handleSizeChange(val) {
      this.offset = (this.current_page - 1) * val
      this.page_size = val
      this.getRemoteApp(this.current_page, val, this.offset)
    },
    handleCurrentChange(val) {
      this.offset = (val - 1) * this.page_size
      this.current_page = val
      this.getRemoteApp(val, this.page_size, this.offset)
    },
    getRemoteApp(draw, limit, offset) {
      this.listLoading = true
      getRemoteAppList({ draw, limit, offset }).then(response => {
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
