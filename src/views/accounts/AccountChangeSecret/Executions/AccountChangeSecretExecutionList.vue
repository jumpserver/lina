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
    const params = new URLSearchParams(this.$route.params).toString()
    return {
      url: `/api/v1/accounts/change-secret-executions/?${params}`,
      detailRoute: 'AccountChangeSecretExecutionDetail',
      automationRoute: 'AccountChangeSecretDetail',
      resource: 'changesecretexecution'
    }
  }
}
</script>
