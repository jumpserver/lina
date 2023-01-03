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
            title: this.$t('accounts.AccountPush.AccountPushList'),
            name: 'AccountPushList',
            hidden: !this.$hasPerm('accounts.view_pushaccountautomation'),
            component: () => import('@/views/accounts/AccountPush/AccountPushList.vue')
          },
          {
            title: this.$t('accounts.AccountPush.AccountPushExecutionList'),
            name: 'AccountPushExecutionList',
            hidden: !this.$hasPerm('accounts.view_pushaccountexecution'),
            component: () => import('@/views/accounts/AccountPush/AccountPushExecutionList.vue')
          }
        ]
      }
    }
  }
}
</script>

<style scoped>
</style>
