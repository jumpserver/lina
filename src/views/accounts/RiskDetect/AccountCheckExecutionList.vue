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
  name: 'CheckAccountExecutionList',
  components: {
    BaseExecutionList
  },
  props: {
    object: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  data() {
    return {
      url: '/api/v1/accounts/check-account-executions/',
      automationRoute: 'AccountCheckDetail',
      detailRoute: 'RiskHistoryExecutionDetail',
      resource: 'checkaccountexecution'
    }
  }
}
</script>
