<template>
  <WrapperContent>
    <IBox :title="$t('users.usergrouplist')">
      <ListTables
        :tablebutton="$t('users.createusergroup')"
        tableroute="UserGroupEdit"
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
      </ListTables>
    </IBox>
  </WrapperContent>
</template>

<script>
import { ListTables, BackPlayground, WrapperContent, IBox } from '@/layout/components'
import { getUserGroupList } from '@/api/user'
import Tables from '@/layout/mixin/ListTables'
export default {
  components: {
    BackPlayground,
    ListTables,
    WrapperContent,
    IBox
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
    handleDetail: function(index, row) {
      this.$router.push({ name: 'UserGroupDetail', params: { id: row.id }})
    },
    handleEdit: function(index, row) {
      this.$router.push({ name: 'UserGroupEdit', params: { id: row.id }})
    },
    handleDelete: function(index, row) {
      this.$router.push({ name: 'UserGroupEdit', params: { id: row.id }})
    },
    handleSizeChange(val) {
      this.offset = (this.current_page - 1) * val
      this.page_size = val
      this.getUsers(this.current_page, val, this.offset)
    },
    handleCurrentChange(val) {
      this.offset = (val - 1) * this.page_size
      this.current_page = val
      this.getUsers(val, this.page_size, this.offset)
    },
    getUsers(draw, limit, offset) {
      this.listLoading = true
      getUserGroupList({ draw, limit, offset }).then(response => {
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
