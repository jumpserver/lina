<template>
  <el-dialog ref="myDialog" v-bind="$attrs" v-on="$listeners" @opened="onOpened">
    <el-input v-model="search" placeholder="请输入内容" @change="onSearchChange" />
    <el-table
      ref="myTable"
      :data="users"
      tooltip-effect="dark"
      style="width: 100%"
      @selection-change="handleUserSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column
        label="用户名"
        width="120"
      >
        <template #default="scope">{{ scope.row.name }}</template>
      </el-table-column>
      <el-table-column
        label="邮箱"
        width="120"
      >
        <template #default="scope">{{ scope.row.email }}</template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page="currentPage"
      :page-size="pageSize"
      layout="total, prev, pager, next"
      :total="total"
      @current-change="handlePaginationCurrentChange"
    />
    <el-button @click="onSubmit">确认</el-button>
  </el-dialog>
</template>

<script>
export default {
  name: 'ListSelect',
  inheritAttrs: false,
  props: {
    initSelectedUsers: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
      users: [
      ],
      currentPageSelectedUsers: [],
      currentPage: 1,
      pageSize: 5,
      total: 0,
      selectedUserIds: new Set(),
      search: ''
    }
  },
  watch: {
    users() {
      this.$nextTick(() => {
        this.toggleRowSelectionOnPageChange()
      })
    },
    initSelectedUsers(val) {
      console.log(val)
    }
  },
  created() {
    console.log(this.initSelectedUsers)
    // this.renderPage()
  },
  methods: {
    onSearchChange() {
      this.renderPage()
    },
    onOpened() {
      this.selectedUserIds = new Set(this.initSelectedUsers)
      this.renderPage()
    },
    moveToSelectedUsers() {
      this.currentPageSelectedUsers.forEach(user => {
        this.selectedUserIds.add(user.id)
      })
    },
    toggleRowSelectionOnPageChange() {
      console.log(`--> toggleRowSelectionOnPageChange before this.selectedUserIds=${this.selectedUserIds.size}`)
      const currentPageSelectedUsers = []
      this.users.forEach(user => {
        if (this.selectedUserIds.has(user.id)) {
          this.$refs.myTable.toggleRowSelection(user)
          currentPageSelectedUsers.push(user)
          this.selectedUserIds.delete(user.id)
        }
      })
      console.log(`--> toggleRowSelectionOnPageChange after this.selectedUserIds=${this.selectedUserIds.size}`)
      this.currentPageSelectedUsers = currentPageSelectedUsers
    },
    getAllSelectedUserIds() {
      const allSelectedUserIds = [...this.selectedUserIds]
      console.log(`getAllSelectedUserIds ${this.currentPageSelectedUsers}`)
      this.currentPageSelectedUsers.forEach(user => {
        console.log(`currentPageSelectedUsers ${user.id}`)
        allSelectedUserIds.push(user.id)
      })
      return allSelectedUserIds
    },
    onSubmit() {
      const allSelectedUserIds = this.getAllSelectedUserIds()

      // clear
      this.currentPageSelectedUsers = []
      this.$refs.myTable.clearSelection()
      console.log(`allSelectedUserIds ${allSelectedUserIds}`)
      this.$emit('submit', allSelectedUserIds)
    },
    handleUserSelectionChange(val) {
      this.currentPageSelectedUsers = val
    },
    handlePaginationCurrentChange(val) {
      this.moveToSelectedUsers()
      this.currentPage = val
      this.renderPage()
    },
    pagination_params() {
      const offset = 0 + (this.currentPage - 1) * this.pageSize
      return {
        offset,
        limit: this.pageSize,
        search: this.search
      }
    },
    renderPage() {
      this.$axios.get(
        '/api/v1/users/users/', { params: this.pagination_params() }
      ).then(res => {
        ({ count: this.total, results: this.users } = res)
      }).catch(err => {
        console.log(err)
      })
    }
  }
}
</script>

<style scoped>

</style>
