<template>
  <GenericDetailPage :object.sync="plan" :active-menu.sync="config.activeMenu" v-bind="config">
    <keep-alive>
      <component :is="config.activeMenu" :object="plan" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import AccountBackupPlanInfo from './AccountBackupPlanInfo'
import AccountBackupPlanExecutionList from './AccountBackupPlanExecution/AccountBackupPlanExecutionList'

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
          },
          {
            title: this.$t('xpack.ChangeAuthPlan.ExecutionList'),
            name: 'AccountBackupPlanExecutionList',
            hidden: () => !this.$hasPerm('assets.view_accountbackupplanexecution')
          }
        ],
        actions: {
          detailApiUrl: `/api/v1/assets/account-backup-plans/${this.$route.params.id}/`,
          deleteApiUrl: `/api/v1/assets/account-backup-plans/${this.$route.params.id}/`
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
