<template>
  <TabPage :active-menu.sync="config.activeMenu" :submenu="config.submenu" />
</template>

<script>
import { TabPage } from '@/layout/components'

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
            component: () => import('@/views/pam/RiskDetect/AccountRiskList.vue')
          },
          {
            title: this.$t('DetectTasks'),
            name: 'AccountCheckTask',
            hidden: !this.$hasPerm('accounts.view_accountcheckautomation'),
            component: () => import('./AccountCheckTaskList.vue')
          },
          {
            title: this.$t('Executions'),
            name: 'AccountCheckExecution',
            hidden: !this.$hasPerm('accounts.view_accountcheckautomation'),
            component: () => import('./AccountCheckExecutionList.vue')
          },
          {
            title: this.$t('DetectEngines'),
            name: 'AccountCheckEngine',
            hidden: !this.$hasPerm('accounts.view_accountcheckautomation'),
            component: () => import('@/views/pam/RiskDetect/AccountCheckEngine.vue')
          }
        ]
      }
    }
  }
}
</script>
