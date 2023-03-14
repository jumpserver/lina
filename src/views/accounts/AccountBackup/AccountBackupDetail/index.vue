<template>
  <GenericDetailPage :active-menu.sync="config.activeMenu" :object.sync="plan" v-bind="config">
    <keep-alive>
      <component :is="config.activeMenu" :object="plan" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import AccountBackupPlanInfo from './AccountBackupInfo.vue'
import AccountBackupPlanExecutionList from './AccountBackupExecution/AccountBackupExecutionList.vue'

export default {
  components: {
    GenericDetailPage,
    AccountBackupPlanInfo,
    AccountBackupPlanExecutionList
  },
  data() {
    return {
      plan: { name: '', comment: '' },
      config: {
        activeMenu: 'AccountBackupPlanInfo',
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'AccountBackupPlanInfo'
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
