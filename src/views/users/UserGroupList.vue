<template>
  <Page>
    <template slot="content">
      <el-alert type="success"> 这里是一个成功的文案 </el-alert>
      <el-card>
        <tables v-bind="tableConfig" />
      </el-card>
    </template>
  </Page>
</template>

<script>
import { IBox, Page } from '@/layout/components'
import Tables from '@/components/ListTables/table'
import { getUserGroupList } from '@/api/user'
export default {
  components: {
    Page,
    Tables,
  },
  data() {
    return {
      tableConfig: {
        getData: getUserGroupList,
        hasSelect: true,
        columns: [
          {
            prop: 'name',
            label: this.$t('usergroup.name'),
            key: 'name',
            link: 'UserDetail',
            sortable: true
          },
          {
            prop: 'user',
            label: this.$t('usergroup.user'),
            key: 'users_amount'
          },
          {
            prop: 'comment',
            label: this.$t('usergroup.comment'),
            key: 'comment'
          }
        ],
        // 写路由名字，table组件会自动传作为参数
        action: {
          hasEdit: 'UserGroupEdit',
          newClick: 'UserGroupEdit'
        }
      }
    }
  }
}
</script>

<style>

</style>
