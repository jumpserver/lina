<template>
  <GenericDetailPage :active-menu.sync="config.activeMenu" :object.sync="plan" v-bind="config">
    <keep-alive>
      <component :is="config.activeMenu" :object="plan" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import AccountBackupInfo from './AccountBackupInfo.vue'
import AccountBackupExecutionList
from '@/views/accounts/AccountBackup/AccountBackupExecution/AccountBackupExecutionList.vue'

export default {
  components: {
    GenericDetailPage,
    AccountBackupInfo,
    AccountBackupExecutionList
  },
  data() {
    return {
      plan: { name: '', comment: '' },
      config: {
        activeMenu: 'AccountBackupInfo',
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'AccountBackupInfo'
          }
        ],
        actions: {
          detailApiUrl: `/api/v1/accounts/account-backup-plans/${this.$route.params.id}/`,
          deleteApiUrl: `/api/v1/accounts/account-backup-plans/${this.$route.params.id}/`,
          deleteSuccessRoute: 'AccountBackupList'
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
