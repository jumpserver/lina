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
import AutoDetailCard from '@/components/Cards/DetailCard/auto.vue'
import { openTaskPage } from '@/utils/jms'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'AccountPushInfo',
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
            disabled: !this.$hasPerm('accounts.add_changesecretexecution') || !this.object.is_active
          },
          callbacks: {
            click: function() {
              this.$axios.post(
                `/api/v1/accounts/push-account-executions/`,
                { automation: this.object.id }
              ).then(res => {
                openTaskPage(res['task'])
              })
            }.bind(this)
          }
        }
      ],
      url: `/api/v1/accounts/push-account-automations/${this.object.id}`,
      detailFields: [
        'id', 'name',
        {
          key: this.$t('Accounts'),
          value: this.object.accounts.join(', ')
        },
        {
          key: this.$t('AssetsOfNumber'),
          value: this.object.assets.length
        },
        {
          key: this.$t('NodeOfNumber'),
          value: this.object.nodes.length
        },
        {
          key: this.$t('PasswordStrategy'),
          value: this.object.secret_strategy.label
        },
        {
          key: this.$t('Crontab'),
          value: this.object.crontab,
          formatter: (item, val) => {
            return <span>{this.object.is_periodic ? val : '-'}</span>
          }
        },
        {
          key: this.$t('Interval'),
          value: this.object.interval,
          formatter: (item, val) => {
            return <span>{this.object.is_periodic ? val : '-'}</span>
          }
        },
        'date_created', 'date_updated', 'comment', 'is_active'
      ]
    }
  },
  computed: {}
}
</script>

<style scoped>

</style>
