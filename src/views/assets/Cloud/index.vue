<template>
  <TabPage :active-menu.sync="config.activeMenu" :submenu="config.submenu" />
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
            title: this.$t('xpack.Cloud.SyncInstanceTaskList'),
            name: 'SyncInstanceTaskList',
            hidden: () => !this.$hasPerm('xpack.view_syncinstancetask'),
            component: () => import('@/views/assets/Cloud/SyncInstanceTask/SyncInstanceTaskList.vue')
          },
          {
            title: this.$t('xpack.Cloud.AccountList'),
            name: 'AccountList',
            hidden: () => !this.$hasPerm('xpack.view_account'),
            component: () => import('@/views/assets/Cloud/Account/AccountList.vue')
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
