<template>
  <TabPage
    :active-menu.sync="config.activeMenu"
    :submenu="config.submenu"
  />
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
        activeMenu: 'AccountBackupList',
        submenu: [
          {
            title: this.$tc('AccountBackupTask', 2),
            name: 'AccountBackupList',
            hidden: !this.$hasPerm('accounts.view_backupaccountautomation'),
            component: () => import('@/views/accounts/AccountBackup/AccountBackupList.vue')
          },
          {
            title: this.$t('ExecutionHistory'),
            name: 'AccountBackupExecutionList',
            hidden: !this.$hasPerm('accounts.view_backupaccountexecution'),
            component: () => import('@/views/accounts/AccountBackup/Executions/AccountBackupExecutionList.vue')
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
