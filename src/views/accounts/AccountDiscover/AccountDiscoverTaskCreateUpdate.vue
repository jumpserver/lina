<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import i18n from '@/i18n/i18n'
import { periodicMeta } from '@/components/const'

export default {
  name: 'AccountDiscoverTaskCreate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      fields: [
        [this.$t('Basic'), ['name', 'nodes', 'assets']],
        [this.$t('Config'), ['is_sync_account', 'check_risk', 'recipients']],
        [this.$t('Periodic'), ['is_periodic', 'crontab', 'interval']],
        [this.$t('Other'), ['is_active', 'comment']]
      ],
      url: '/api/v1/accounts/gather-account-automations/',
      hasDetailInMsg: false,
      fieldsMeta: {
        ...periodicMeta,
        is_sync_account: {
          label: this.$t('IsSyncAccountLabel'),
          helpText: this.$t('IsSyncAccountHelpText')
        },
        check_risk: {},
        assets: {
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
      createSuccessNextRoute: { name: 'AccountDiscover' },
      updateSuccessNextRoute: { name: 'AccountDiscover' },
      cleanFormValue(values) {
        values.interval = values.interval || null
        return values
      }
    }
  }
}

</script>
