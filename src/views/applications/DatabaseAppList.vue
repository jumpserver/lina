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
import { getDatabaseAppList } from '@/api/applications'

export default {
  components: {
    Page,
    Tables
  },
  data() {
    return {
      tableConfig: {
        getData: getDatabaseAppList,
        hasSelect: true,
        columns: [
          {
            prop: 'name',
            label: this.$t('common.name'),
            key: 'name',
            link: 'DatabaseAppDetail',
            sortable: true
          },
          {
            prop: 'type',
            label: this.$t('applications.type'),
            key: 'get_type_display'
          },
          {
            prop: 'host',
            label: this.$t('applications.host'),
            key: 'host'
          },
          {
            prop: 'database',
            label: this.$t('applications.database'),
            key: 'database'
          },
          {
            prop: 'port',
            label: this.$t('applications.port'),
            key: 'port'
          },
          {
            prop: 'comment',
            label: this.$t('common.Comment'),
            key: 'comment'
          }
        ],
        action: {
          hasEdit: 'DatabaseAppEdit',
          newClick: 'DatabaseAppEdit'
        }
      }
    }
  }
}
</script>

<style>

</style>
