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
import { getRemoteAppList } from '@/api/applications'

export default {
  components: {
    Page,
    Tables
  },
  data() {
    return {
      tableConfig: {
        getData: getRemoteAppList,
        hasSelect: true,
        columns: [
          {
            prop: 'name',
            label: this.$t('common.name'),
            key: 'name',
            link: 'RemoteAppDetail',
            sortable: true
          },
          {
            prop: 'app_type',
            label: this.$t('applications.app_type'),
            key: 'get_type_display'
          },
          {
            prop: 'assets',
            label: this.$t('applications.asset'),
            key: 'asset'
          },
          {
            prop: 'comment',
            label: this.$t('common.Comment'),
            key: 'comment'
          }
        ],
        action: {
          hasEdit: 'RemoteAppEdit',
          newClick: 'RemoteAppEdit'
        }
      }
    }
  }
}
</script>

<style>

</style>
