<template>
  <TwoCol>
    <template>
      <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    </template>
    <template #right>
      <QuickActions :actions="quickActions" type="primary" />
    </template>
  </TwoCol>
</template>

<script>
import { QuickActions } from '@/components'
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import { openTaskPage } from '@/utils/jms'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'AccountCheckDetail',
  components: {
    TwoCol,
    AutoDetailCard,
    QuickActions
  },
  props: {
    object: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  data() {
    return {
      quickActions: [
        {
          title: this.$t('ManualExecution'),
          attrs: {
            type: 'primary',
            label: this.$t('Execute'),
            disabled: !this.$hasPerm('accounts.add_checkaccountautomation') || !this.object.is_active
          },
          callbacks: {
            click: function() {
              this.$axios.post(
                `/api/v1/accounts/check-account-executions/`,
                { automation: this.object.id }
              ).then(res => {
                openTaskPage(res['task'])
              })
            }.bind(this)
          }
        }
      ],
      url: `/api/v1/accounts/check-account-automations/${this.object.id}`,
      detailFields: [
        'id', 'name', 'date_created', 'date_updated', 'comment'
      ]
    }
  }
}
</script>

<style scoped>

</style>
