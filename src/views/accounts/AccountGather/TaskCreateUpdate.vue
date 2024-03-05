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
        [this.$t('common.Basic'), ['name', 'nodes', 'assets']],
        [this.$t('xpack.Timer'), ['is_periodic', 'crontab', 'interval']],
        [this.$t('common.Other'), ['is_sync_account', 'is_active', 'recipients', 'comment']]
      ],
      url: '/api/v1/accounts/gather-account-automations/',
      hasDetailInMsg: false,
      fieldsMeta: {
        is_sync_account: {
          type: 'switch',
          label: this.$t('accounts.AccountGather.IsSyncAccountLabel'),
          helpText: this.$t('accounts.AccountGather.IsSyncAccountHelpText')
        },
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
        assets: {
          label: this.$tc('assets.Asset'),
          el: {
            multiple: true,
            value: [],
            ajax: {
              transformOption: (item) => {
                return { label: item.name + '(' + item.address + ')', value: item.id }
              },
              url: '/api/v1/assets/assets/?gather_accounts_enabled=true'
            }
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
        },
        recipients: {
          label: i18n.t('accounts.AccountChangeSecret.Addressee'),
          helpText: i18n.t('accounts.AccountChangeSecret.OnlyMailSend'),
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
