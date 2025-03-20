<template>
  <BaseExecutionList
    :automation-route="automationRoute"
    :custom-actions="customActions"
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
      resource: 'changesecretexecution',
      customActions: {
        name: 'record',
        title: this.$t('Record'),
        can: this.$hasPerm('accounts.view_changesecretrecord'),
        callback: function({ row }) {
          return this.$router.push({
            name: 'AccountChangeSecretList',
            query: {
              tab: 'ChangeSecretRecord',
              execution_id: row.id
            }
          })
        }
      }
    }
  }
}
</script>
