<template>
  <BackPlayground :title="$t('perms.RemoteAppPermissionList')">
    <ListTables
      :tablebutton="$t('perms.RemoteAppPermissionCreate')"
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
          :label="this.$t('perms.name')"
          sortable
          align="center"
          header-align="center"
        >
          <template slot-scope="scope">
            <el-button type="text" size="small" style="font-size:14px" @click="handleDetail(scope.$index, scope.row)">{{ scope.row.name }}</el-button>
          </template>
        </el-table-column>
        <el-table-column
          :label="this.$t('perms.user')"
          sortable
          align="center"
          header-align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.users.length }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="this.$t('perms.user_group')"
          sortable
          align="center"
          header-align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.user_groups.length }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="this.$t('perms.remote_app')"
          sortable
          align="center"
          header-align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.remote_apps.length }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="this.$t('perms.system_user')"
          sortable
          align="center"
          header-align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.system_users.length }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="this.$t('perms.validity')"
          width="80"
          align="center"
          header-align="center"
          sortable
        >
          <template slot-scope="scope">
            <i v-if="scope.row.is_active === true " class="fa fa-check text-navy" />
            <i v-if="scope.row.is_active === false " class="fa fa-check text-danger" />
          </template>
        </el-table-column>
        <el-table-column
          :label="this.$t('perms.comment')"
          sortable
          align="center"
          header-align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.comment }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="this.$t('perms.action')"
          align="center"
          header-align="center"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="handleEdit(scope.$index, scope.row)"
            >{{ $t('perms.update') }}</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.$index, scope.row)"
            >{{ $t('perms.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </ListTables>
  </BackPlayground>
</template>

<script>
import { ListTables, BackPlayground } from '@/layout/components'
import { getRemoteAppPermissionList } from '@/api/perms'
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
    this.getRemoteAppPermission(this.current_page, this.page_size, this.offset)
  },
  methods: {
    handleDetail: function(index, row) {
      this.$router.push({ name: 'RemoteAppPermissionDetail', params: { id: row.id }})
    },
    handleEdit: function(index, row) {
      this.$router.push({ name: 'RemoteAppPermissionEdit', params: { id: row.id }})
    },
    handleDelete: function(index, row) {
    },
    handleSizeChange(val) {
      this.offset = (this.current_page - 1) * val
      this.page_size = val
      this.getRemoteAppPermission(this.current_page, val, this.offset)
    },
    handleCurrentChange(val) {
      this.offset = (val - 1) * this.page_size
      this.current_page = val
      this.getRemoteAppPermission(val, this.page_size, this.offset)
    },
    getRemoteAppPermission(draw, limit, offset) {
      this.listLoading = true
      getRemoteAppPermissionList({ draw, limit, offset }).then(response => {
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
