<template>
  <BackPlayground :title="$t('route.UserList')">
    <el-data-table v-bind="tableConfig" />
  </BackPlayground>
</template>

<script>
import { BackPlayground } from '@/layout/components'
import { getUserList } from '@/api/user'
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
        form: [
          {
            type: 'input',
            id: 'login',
            label: '用户名',
            rules: [
              {
                required: true,
                message: '请输入用户名',
                trigger: 'blur',
                transform: v => v && v.trim()
              }
            ],
            el: { placeholder: '请输入用户名' }
          },
          {
            type: 'select',
            id: 'type',
            label: '账户类型',
            rules: [{ required: true, message: '请选择账户类型', trigger: 'blur' }],
            options: ['Organization', 'User'].map(f => ({ label: f, value: f })),
            el: {
              placeholder: '请选择'
            }
          }
        ],
        axiosConfig: {
          params: {
            draw: 1
          },
          raw: 1
        },
        url: '/api/v1/users/users/',
        dataPath: 'results',
        totalPath: 'count',
        pageSizeKey: 'limit',
        pageKey: 'offset',
        columns: [
          { type: 'selection' },
          {
            prop: 'name',
            label: 'Name'
          },
          {
            prop: 'username',
            label: 'Username'
          },
          {
            prop: 'role',
            label: 'Role'
          }
        ]
      }
    }
  },
  created() {
    // this.getUsers(this.current_page, this.page_size, this.offset)
  },
  methods: {
    // 处理显示详情
    handleDetail: function(index, row) {
      this.$router.push({ name: 'UserDetail', params: { id: row.id }})
    },
    handleMutiSelectChange(val) {
      console.log(val)
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
