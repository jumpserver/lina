<template>
  <TabPage :active-menu.sync="config.activeMenu" :submenu="config.submenu" />
</template>

<script>
import { TabPage } from '@/layout/components'

export default {
  name: 'Index',
  components: {
    TabPage
  },
  data() {
    return {
      config: {
        activeMenu: 'AccountDiscoverList',
        submenu: [
          {
            title: this.$t('GatheredAccountList'),
            name: 'AccountDiscoverList',
            hidden: !this.$hasPerm('accounts.view_gatheredaccount'),
            component: () => import('@/views/accounts/AccountDiscover/AccountDiscoverList.vue')
          },
          {
            title: this.$t('AccountDiscoverTaskList'),
            name: 'AccountDiscoverTaskList',
            hidden: !this.$hasPerm('accounts.view_gatheraccountsautomation'),
            component: () => import('@/views/accounts/AccountDiscover/AccountDiscoverTaskList.vue')
          },
          {
            title: this.$t('ExecutionList'),
            name: 'AccountDiscoverTaskExecutionList',
            hidden: !this.$hasPerm('accounts.view_gatheraccountsexecution'),
            component: () => import('@/views/accounts/AccountDiscover/TaskDetail/TaskExecutionList.vue')
          }
        ]
      }
    }
  }
}
</script>

<style scoped>
</style>
