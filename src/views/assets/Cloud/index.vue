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
        activeMenu: 'SyncInstanceTaskList',
        submenu: [
          {
            title: this.$t('common.SyncTask'),
            name: 'SyncInstanceTaskList',
            hidden: () => !this.$hasPerm('xpack.view_syncinstancetask'),
            component: () => import('@/views/assets/Cloud/SyncInstanceTask/SyncInstanceTaskList.vue')
          },
          {
            title: this.$t('xpack.Cloud.SyncStrategy'),
            name: 'StrategyList',
            hidden: () => !this.$hasPerm('xpack.view_strategy'),
            component: () => import('@/views/assets/Cloud/Strategy/StrategyList.vue')
          },
          {
            title: this.$t('xpack.Cloud.AccountList'),
            name: 'AccountList',
            hidden: () => !this.$hasPerm('xpack.view_account'),
            component: () => import('@/views/assets/Cloud/Account/AccountList.vue')
          }
        ],
        actions: {
          deleteSuccessRoute: 'AssetList'
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
