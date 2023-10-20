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
        activeMenu: 'AccountList',
        submenu: [
          {
            title: this.$t('accounts.GeneralAccounts'),
            name: 'AccountList',
            component: () => import('@/views/accounts/Account/AccountList.vue')
          },
          {
            title: this.$t('accounts.VirtualAccounts'),
            name: 'VirtualAccountList',
            component: () => import('@/views/accounts/VirtualAccount/VirtualList.vue')
          }
        ]
      }
    }
  }
}
</script>

<style scoped>
</style>
