<template>
  <TabPage v-model:active-menu="config.activeMenu" :disabled="!hasValidLicense" :submenu="config.submenu" />
</template>

<script>
import { TabPage } from '@/layout/components'
import { mapGetters } from 'vuex'

export default {
  name: 'AccountCheck',
  components: {
    TabPage
  },
  data() {
    return {
      config: {
        activeMenu: 'AccountRisks',
        submenu: [
          {
            title: this.$t('DetectResults'),
            name: 'AccountRisks',
            hidden: !this.$hasPerm('accounts.view_accountrisk'),
            component: () => import('@/views/accounts/RiskDetect/AccountRiskList.vue')
          },
          {
            title: this.$t('DetectTasks'),
            name: 'AccountCheckTask',
            hidden: !this.$hasPerm('accounts.view_checkaccountautomation'),
            component: () => import('./AccountCheckTaskList.vue')
          },
          {
            title: this.$t('ExecutionHistory'),
            name: 'AccountCheckExecution',
            hidden: !this.$hasPerm('accounts.view_checkaccountexecution'),
            component: () => import('./AccountCheckExecutionList.vue')
          },
          {
            title: this.$t('DetectEngines'),
            name: 'AccountCheckEngine',
            hidden: !this.$hasPerm('accounts.view_checkaccountengine'),
            component: () => import('@/views/accounts/RiskDetect/AccountCheckEngine.vue')
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
