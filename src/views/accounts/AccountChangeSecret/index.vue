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
        activeMenu: 'AccountChangeSecretList',
        submenu: [
          {
            title: this.$t('AccountChangeSecret'),
            name: 'AccountChangeSecretList',
            hidden: () => !this.$hasPerm('accounts.view_changesecretautomation'),
            component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretList.vue')
          },
          {
            title: this.$t('ExecutionList'),
            name: 'AccountChangeSecretExecutionList',
            hidden: () => !this.$hasPerm('accounts.view_changesecretexecution'),
            component: () => import(
              '@/views/accounts/AccountChangeSecret/AccountChangeSecretDetail/AccountChangeSecretExecution/AccountChangeSecretExecutionList.vue'
              )
          }
        ]
      }
    }
  }
}
</script>
