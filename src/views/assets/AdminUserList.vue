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
import { Page } from '@/layout/components'
import Tables from '@/components/ListTables/table'
import { getAdminUserList } from '@/api/asset'

export default {
  components: {
    Page,
    Tables
  },
  data() {
    return {
      tableConfig: {
        getData: getAdminUserList,
        hasSelect: true,
        columns: [
          {
            prop: 'name',
            label: this.$t('common.name'),
            key: 'name',
            link: 'AdminUserDetail',
            sortable: true
          },
          {
            prop: 'username',
            label: this.$t('common.username'),
            key: 'username'
          },
          {
            prop: 'assets',
            label: this.$t('assets.asset'),
            key: 'assets_amount'
          },
          {
            prop: 'comment',
            label: this.$t('assets.comment'),
            key: 'comment'
          }
        ],
        action: {
          hasEdit: 'AdminUserEdit',
          newClick: 'AdminUserEdit'
        }
      }
    }
  }
}
</script>

<style>

</style>
