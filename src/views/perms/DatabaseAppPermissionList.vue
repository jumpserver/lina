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
import { getDatabaseAppPermissionList } from '@/api/perms'
export default {
  components: {
    Page,
    Tables
  },
  data() {
    return {
      tableConfig: {
        getData: getDatabaseAppPermissionList,
        hasSelect: true,
        columns: [
          {
            prop: 'name',
            label: this.$t('common.name'),
            key: 'name',
            link: 'DatabaseAppPermissionDetail',
            sortable: true
          },
          {
            prop: 'user',
            label: this.$t('perms.user'),
            key: 'users'
          },
          {
            prop: 'userGroup',
            label: this.$t('perms.userGroup'),
            key: 'user_groups'
          },
          {
            prop: 'databaseApp',
            label: this.$t('perms.databaseApp'),
            key: 'database_apps'
          },
          {
            prop: 'systemUser',
            label: this.$t('perms.systemUser'),
            key: 'system_users'
          },
          {
            prop: 'validity',
            label: this.$t('perms.validity'),
            key: 'is_valid'
          }
        ],
        // 写路由名字，table组件会自动传作为参数
        action: {
          hasEdit: 'DatabaseAppPermissionEdit',
          newClick: 'DatabaseAppPermissionEdit'
        }
      }
    }
  }
}
</script>

<style>

</style>
