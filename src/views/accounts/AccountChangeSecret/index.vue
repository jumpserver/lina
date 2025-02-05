<template>
  <TabPage :active-menu.sync="config.activeMenu" :submenu="config.submenu" :disabled="!hasValidLicense" />
</template>

<script>
import { TabPage } from '@/layout/components'
import { mapGetters } from 'vuex'

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
            title: this.$t('Overview'),
            name: 'AccountChangeDashboard',
            component: () => import('@/views/dashboard/ChangeSecret')
          },
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
              '@/views/accounts/AccountChangeSecret/AccountChangeSecretExecution/AccountChangeSecretExecutionList.vue'
              )
          }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['hasValidLicense'])
  }
}
</script>
