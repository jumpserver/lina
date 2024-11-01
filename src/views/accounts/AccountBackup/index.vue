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
        activeMenu: 'AccountBackupList',
        submenu: [
          {
            title: this.$t('AccountBackup'),
            name: 'AccountBackupList',
            hidden: !this.$hasPerm('accounts.view_accountbackupautomation'),
            component: () => import('@/views/accounts/AccountBackup/AccountBackupList.vue')
          },
          {
            title: this.$t('ExecutionList'),
            name: 'AccountBackupExecutionList',
            hidden: !this.$hasPerm('accounts.view_accountbackupexecution'),
            component: () => import('@/views/accounts/AccountBackup/AccountBackupExecution/AccountBackupExecutionList.vue')
          }
        ]
      }
    }
  }
}
</script>

<style scoped>
</style>
