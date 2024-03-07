<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { CronTab } from '@/components'
import i18n from '@/i18n/i18n'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      fields: [
        [this.$t('Basic'), ['name', 'nodes']],
        [this.$t('Periodic'), ['is_periodic', 'crontab', 'interval']],
        [this.$t('Other'), ['is_sync_account', 'is_active', 'recipients', 'comment']]
      ],
      url: '/api/v1/accounts/gather-account-automations/',
      hasDetailInMsg: false,
      fieldsMeta: {
        is_sync_account: {
          type: 'switch',
          label: this.$t('IsSyncAccountLabel'),
          helpText: this.$t('IsSyncAccountHelpText')
        },
        crontab: {
          component: CronTab,
          hidden: (formValue) => {
            return !formValue.is_periodic
          },
          helpText: this.$t('CrontabOfCreateUpdatePage')
        },
        interval: {
          label: this.$t('Interval'),
          helpText: this.$t('IntervalOfCreateUpdatePage'),
          hidden: (formValue) => {
            return !formValue.is_periodic
          }
        },
        nodes: {
          label: this.$tc('Node'),
          el: {
            multiple: true,
            value: [],
            ajax: {
              transformOption: (item) => {
                return { label: item['full_value'], value: item.id }
              },
              url: '/api/v1/assets/nodes/'
            }
          }
        },
        is_periodic: {
          type: 'switch'
        },
        recipients: {
          label: i18n.t('Recipient'),
          helpText: i18n.t('OnlyMailSend'),
          el: {
            value: [],
            ajax: {
              url: '/api/v1/users/users/?fields_size=mini',
              transformOption: (item) => {
                return { label: item.name + '(' + item.username + ')', value: item.id }
              }
            }
          }
        }
      },
      createSuccessNextRoute: { name: 'AccountGatherList' },
      updateSuccessNextRoute: { name: 'AccountGatherList' },
      cleanFormValue(values) {
        values.interval = values.interval || null
        return values
      }
    }
  }
}

</script>

<style lang="less" scoped>
</style>
