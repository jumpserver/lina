<template>
  <BaseExecutionList
    :automation-route="automationRoute"
    :detail-route="detailRoute"
    :resource="resource"
    :url="url"
  />
</template>

<script>
import BaseExecutionList from '@/views/accounts/Automation/BaseExecutionList.vue'

export default {
  name: 'AccountBackupExecutionList',
  components: {
    BaseExecutionList
  },
  data() {
    return {
      url: '/api/v1/accounts/account-backup-plan-executions/',
      detailRoute: 'AccountBackupExecutionDetail',
      automationRoute: 'AccountBackupDetail',
      resource: 'backupaccountexecution'
    }
  }
}
</script>
