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
import { getSystemUserList } from '@/api/asset'

export default {
  components: {
    Page,
    Tables
  },
  data() {
    return {
      tableConfig: {
        getData: getSystemUserList,
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
            prop: 'username',
            label: this.$t('common.username'),
            key: 'assets_amount'
          },
          {
            prop: 'protocol',
            label: this.$t('assets.protocol'),
            key: 'protocol'
          },
          {
            prop: 'loginMode',
            label: this.$t('assets.loginMode'),
            key: 'login_mode_display'
          },
          {
            prop: 'asset',
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
          hasEdit: 'SystemUserEdit',
          newClick: 'SystemUserEdit'
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
