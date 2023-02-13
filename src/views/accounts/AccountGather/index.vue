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
        activeMenu: 'AccountGatherList',
        submenu: [
          {
            title: this.$t('accounts.AccountGather.AccountGatherTaskList'),
            name: 'AccountGatherList',
            hidden: !this.$hasPerm('accounts.view_gatheredaccount'),
            component: () => import('@/views/accounts/AccountGather/AccountGatherList.vue')
          },
          {
            title: this.$t('accounts.AccountGather.AccountGatherList'),
            name: 'AccountGatherTaskList',
            hidden: !this.$hasPerm('accounts.view_gatheraccountsautomation'),
            component: () => import('@/views/accounts/AccountGather/AccountGatherTaskList.vue')
          },
          {
            title: this.$t('accounts.AccountGather.ExecutionList'),
            name: 'AccountGatherTaskExecutionList',
            hidden: !this.$hasPerm('accounts.view_gatheraccountsexecution'),
            component: () => import('@/views/accounts/AccountGather/TaskDetail/TaskExecutionList.vue')
          }
        ]
      }
    }
  }
}
</script>

<style scoped>
</style>
