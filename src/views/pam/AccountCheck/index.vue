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
            title: this.$t('检查结果'),
            name: 'AccountRisks',
            hidden: !this.$hasPerm('accounts.view_accountrisk'),
            component: () => import('@/views/pam/AccountCheck/AccountRiskList.vue')
          },
          {
            title: this.$t('检查任务'),
            name: 'AccountCheckTask',
            hidden: !this.$hasPerm('accounts.view_accountcheckautomation'),
            component: () => import('./AccountCheckTaskList.vue')
          },
          {
            title: this.$t('执行历史'),
            name: 'AccountCheckExecution',
            hidden: !this.$hasPerm('accounts.view_accountcheckautomation'),
            component: () => import('./AccountCheckExecutionList.vue')
          },
          {
            title: this.$t('检查引擎'),
            name: 'AccountCheckEngine',
            hidden: !this.$hasPerm('accounts.view_accountcheckautomation'),
            component: () => import('@/views/pam/AccountCheck/AccountCheckEngine.vue')
          }
        ]
      }
    }
  }
}
</script>
