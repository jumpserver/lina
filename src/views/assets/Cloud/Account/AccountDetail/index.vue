<template>
  <GenericDetailPage :active-menu.sync="config.activeMenu" :object.sync="Account" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="Account" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import TaskSyncAssetList from './TaskSyncAssetList'
import TaskHistoryList from './TaskHistoryList'
import AccountDetail from './AccountDetail'

export default {
  components: {
    GenericDetailPage,
    TaskSyncAssetList,
    TaskHistoryList,
    AccountDetail,
    TabPage
  },
  data() {
    return {
      Account: {
        name: '', provider: '', provider_display: '', validity_display: '', comment: '', date_created: '', created_by: '', task: {}
      },
      config: {
        url: `/api/v1/xpack/cloud/accounts`,
        activeMenu: 'AccountDetail',
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'AccountDetail'
          },
          {
            title: this.$t('SyncInstanceTaskHistoryList'),
            name: 'TaskHistoryList',
            hidden: () => { return !this.Account.task?.id }
          },
          {
            title: this.$t('SyncInstanceTaskHistoryAssetList'),
            name: 'TaskSyncAssetList',
            hidden: () => { return !this.Account.task?.id }
          }
        ]
      }
    }
  }
}
</script>

<style lang='scss' scoped>

</style>

