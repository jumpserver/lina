<template>
  <BaseExecutionList
    :automation-route="automationRoute"
    :resource-label="resourceLabel"
    :custom-actions="customActions"
    :detail-drawer="detailDrawer"
    :detail-route="detailRoute"
    :resource="resource"
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
      detailDrawer: () => import('@/views/accounts/AccountPush/ExecutionDetail/index.vue'),
      customActions: {
        name: 'record',
        title: this.$t('Record'),
        can: this.$hasPerm('accounts.view_pushsecretrecord'),
        callback: function({ row }) {
          return this.$router.push({
            name: 'AccountPush',
            query: {
              tab: 'AccountPushRecord',
              execution_id: row.id
            }
          })
        }
      }
    }
  }
}
</script>
