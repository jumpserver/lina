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
            title: this.$t('AccountPushList'),
            name: 'AccountPushList',
            hidden: !this.$hasPerm('accounts.view_pushaccountautomation'),
            component: () => import('@/views/accounts/AccountPush/AccountPushList.vue'),
            helpTip: this.$t('In the push system, if the account already exists, the ciphertext of the account will be used for push; if the account does not exist, the account will be created according to the filled-in ciphertext and then pushed.')
          },
          {
            title: this.$t('ExecutionList'),
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
