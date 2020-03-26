<template>
  <IBox :title="$t('route.UserList')">
    <el-data-table v-bind="tableConfig" :on-new="onNew" style="margin:0 12px 12px 12px;" />
  </IBox>
</template>

<script>
import { IBox } from '@/layout/components'

export default {
  components: {
    IBox
  },
  data() {
    return {
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
        hasDelete: false,
        hasAction: true, // 是否有更多操作
        hasUpload: false,
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
        searchForm: [
          {
            type: 'input',
            id: 'search', // 发起请求附带的查询参数
            width: '200px',
            el: { placeholder: '搜索', clearable: true, size: 'small' },
            rules: [{ required: false, trigger: 'blur', max: 12 }]
          }
        ],
        columns: [
          { type: 'selection' },
          // Bug
          // 应该让我插入Slot,使这个用户名可点击
          {
            prop: 'name',
            label: this.$t('users.name'),
            sortable: true, // 可排序
            url: 'UserDetail' // 第一个函数指定 路由Template
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
            label: this.$t('users.usergroup'),
            sortable: true
          },
          {
            prop: 'source',
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
    onNew: () => {
      alert('创建')
    }
  }
}
</script>

<style lang="less" scoped>

</style>
