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
  name: 'AccountChangeSecretExecutionList',
  components: {
    BaseExecutionList
  },
  data() {
    return {
      url: '/api/v1/accounts/change-secret-executions/',
      detailRoute: 'AccountChangeSecretExecutionDetail',
      automationRoute: 'AccountChangeSecretDetail',
      resource: 'changesecretexecution'
    }
  }
}
</script>
