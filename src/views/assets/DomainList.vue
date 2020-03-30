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
import { getDomainList } from '@/api/asset'

export default {
  components: {
    Page,
    Tables
  },
  data() {
    return {
      tableConfig: {
        getData: getDomainList,
        hasSelect: true,
        columns: [
          {
            prop: 'name',
            label: this.$t('common.name'),
            key: 'name',
            link: 'DomainDetail',
            sortable: true
          },
          {
            prop: 'asset',
            label: this.$t('assets.asset'),
            key: 'asset_count'
          },
          {
            prop: 'gateway',
            label: this.$t('assets.gateway'),
            key: 'gateway_count'
          },
          {
            prop: 'comment',
            label: this.$t('assets.comment'),
            key: 'comment'
          }
        ],
        action: {
          hasEdit: 'DomainEdit',
          newClick: 'DomainEdit'
        }
      }
    }
  }
}
</script>

<style>

</style>
