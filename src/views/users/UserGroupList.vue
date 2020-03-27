<template>
  <Page>
    <template slot="content">
      <el-alert
        title="成功提示的文案"
        type="success">
      </el-alert>
      <tables v-bind="tableConfig" />
    </template>
  </Page>
</template>

<script>
import { Page, Tables } from '@/layout/components'
import { getUserGroupList } from '@/api/user'
export default {
  components: {
    Page,
    Tables
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
            nextroute: 'UserGroupDetail'
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
        ]
      }
    }
  }
}
</script>

<style>

</style>
