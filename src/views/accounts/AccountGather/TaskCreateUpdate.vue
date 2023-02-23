<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { CronTab } from '@/components'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      fields: [
        [this.$t('common.Basic'), ['name', 'nodes']],
        [this.$t('xpack.Timer'), ['is_periodic', 'crontab', 'interval']],
        [this.$t('common.Other'), ['is_active', 'comment']]
      ],
      url: '/api/v1/accounts/gather-account-automations/',
      hasDetailInMsg: false,
      fieldsMeta: {
        crontab: {
          component: CronTab,
          hidden: (formValue) => {
            return !formValue.is_periodic
          },
          helpText: this.$t('accounts.AccountChangeSecret.HelpText.CrontabOfCreateUpdatePage')
        },
        interval: {
          label: this.$t('accounts.AccountChangeSecret.CyclePerform'),
          helpText: this.$t('accounts.AccountChangeSecret.HelpText.IntervalOfCreateUpdatePage'),
          hidden: (formValue) => {
            return !formValue.is_periodic
          }
        },
        nodes: {
          label: this.$tc('assets.Node'),
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
