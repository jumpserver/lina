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
import Tables from '@/components/ListTable/index'
import { getCommandFilterList } from '@/api/asset'

export default {
  components: {
    Page,
    Tables
  },
  data() {
    return {
      tableConfig: {
        getData: getCommandFilterList,
        hasSelect: true,
        columns: [
          {
            prop: 'name',
            label: this.$t('common.name'),
            key: 'name',
            link: 'CommandFilterDetail',
            sortable: true
          },
          {
            prop: 'rules',
            label: this.$t('assets.rules'),
            key: 'rules'
          },
          {
            prop: 'system_users',
            label: this.$t('assets.system_user'),
            key: 'system_users'
          },
          {
            prop: 'comment',
            label: this.$t('assets.comment'),
            key: 'comment'
          }
        ],
        action: {
          hasEdit: 'CommandFilterEdit',
          newClick: 'CommandFilterEdit'
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
