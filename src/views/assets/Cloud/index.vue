<template>
  <TabPage :active-menu.sync="config.activeMenu" v-bind="config" />
</template>

<script>
import { TabPage } from '@/layout/components'

export default {
  name: 'CloudIndex',
  components: {
    TabPage
  },
  data() {
    return {
      config: {
        title: '',
        activeMenu: 'CloudAccountList',
        submenu: [
          {
            title: this.$t('CloudAccountList'),
            name: 'CloudAccountList',
            hidden: () => !this.$hasPerm('xpack.view_account'),
            component: () => import('@/views/assets/Cloud/Account/AccountList.vue')
          },
          {
            title: this.$t('SyncStrategy'),
            name: 'StrategyList',
            hidden: () => !this.$hasPerm('xpack.view_strategy'),
            component: () => import('@/views/assets/Cloud/Strategy/StrategyList.vue')
          },
          {
            title: this.$t('SyncInstanceTaskHistoryAssetList'),
            name: 'TaskSyncAssetList',
            hidden: () => !this.$hasLicense() || !this.$hasPerm('xpack.view_syncinstancedetail'),
            component: () => import('@/views/assets/Cloud/Account/AccountDetail/TaskSyncAssetList.vue')
          }
        ],
        actions: {
          deleteSuccessRoute: 'AssetList'
        }
      }
    }
  },
  mounted() {
    const category = this.$route.query.category || 'host'
    const display = category === 'host' ? this.$t('Host') : this.$t('Database')
    this.config.title = `${display} - ${this.$t('CloudSync')}`
  }
}
</script>
