<template>
  <Page>
    <template slot="content">
      <el-alert
        title="成功提示的文案"
        type="success"
      />
      <IBox>
        <tables v-bind="tableConfig" />
      </IBox>
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
    IBox
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
