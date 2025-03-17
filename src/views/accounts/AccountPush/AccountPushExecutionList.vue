<template>
  <BaseExecutionList
    :automation-route="automationRoute"
    :detail-drawer="detailDrawer"
    :detail-route="detailRoute"
    :resource="resource"
    :resource-label="resourceLabel"
    :url="url"
  />
</template>

<script>
import BaseExecutionList from '@/views/accounts/Automation/BaseExecutionList.vue'

export default {
  name: 'AccountPushExecutionList',
  components: {
    BaseExecutionList
  },
  data() {
    return {
      url: '/api/v1/accounts/push-account-executions/',
      automationRoute: 'AccountPushDetail',
      detailRoute: 'AccountPushExecutionDetail',
      resource: 'pushaccountexecution',
      resourceLabel: this.$t('AccountPushExecution'),
      detailDrawer: () => import('@/views/accounts/AccountPush/ExecutionDetail/index.vue')
    }
  }
}
</script>
