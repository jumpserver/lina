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
        activeMenu: 'AccountPushList',
        submenu: [
          {
            title: this.$tc('AccountPushTask', 2),
            name: 'AccountPushList',
            hidden: !this.$hasPerm('accounts.view_pushaccountautomation'),
            component: () => import('@/views/accounts/AccountPush/AccountPushList.vue')
          },
          {
            title: this.$t('ExecutionHistory'),
            name: 'AccountPushExecutionList',
            hidden: !this.$hasPerm('accounts.view_pushaccountexecution'),
            component: () => import('@/views/accounts/AccountPush/AccountPushExecutionList.vue')
          },
          {
            title: this.$t('ExecutionRecord'),
            name: 'AccountPushRecord',
            hidden: () => !this.$hasPerm('accounts.view_pushsecretrecord'),
            component: () => import('@/views/accounts/AccountPush/ExecutionDetail/AccountPushRecord.vue')
          }
        ]
      }
    }
  }
}
</script>
