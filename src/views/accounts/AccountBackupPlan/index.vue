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
        activeMenu: 'AccountBackupPlanList',
        submenu: [
          {
            title: this.$t('accounts.AccountBackup.AccountBackup'),
            name: 'AccountBackupPlanList',
            hidden: !this.$hasPerm('accounts.view_accountbackupautomation'),
            component: () => import('@/views/accounts/AccountBackupPlan/AccountBackupPlanList.vue')
          },
          {
            title: this.$t('accounts.AccountBackup.ExecutionList'),
            name: 'AccountBackupPlanExecutionList',
            hidden: !this.$hasPerm('accounts.view_accountbackupexecution'),
            component: () => import('@/views/accounts/AccountBackupPlan/AccountBackupPlanExecution/AccountBackupPlanExecutionList.vue')
          }
        ]
      }
    }
  }
}
</script>

<style scoped>
</style>
