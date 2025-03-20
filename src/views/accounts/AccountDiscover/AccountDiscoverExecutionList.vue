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
  name: 'AccountDiscoverTaskExecutionList',
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
      url: '/api/v1/accounts/gather-account-executions/',
      detailRoute: 'AccountDiscoverExecutionDetail',
      automationRoute: 'AccountDiscoverTaskDetail',
      resource: 'gatheraccountsexecution'
    }
  }
}
</script>
