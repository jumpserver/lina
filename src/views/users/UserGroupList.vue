<template>
  <Page>
    <el-alert type="success"> 这里是一个成功的文案 </el-alert>
    <ListTable :table-config="tableConfig" />
  </Page>
</template>

<script>
import { Page } from '@/layout/components'
import ListTable from '@/components/ListTable'
export default {
  components: {
    Page,
    ListTable
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/users/groups/',
        columns: [
          {
            type: 'selection'
          },
          {
            prop: 'name',
            label: this.$tc('Name'),
            key: 'name',
            link: 'UserGroupDetail',
            sortable: true
          },
          {
            prop: 'users_amount',
            label: this.$t('users.User'),
            key: 'users_amount'
          },
          {
            prop: 'comment',
            label: this.$tc('Comment'),
            key: 'comment',
            showOverflowTooltip: true
          }
        ],
        // 写路由名字，table组件会自动传作为参数
        action: {
          hasEdit: 'UserGroupEdit',
          newClick: 'UserGroupEdit'
        }
      },

    }
  }
}
</script>

<style>

</style>
