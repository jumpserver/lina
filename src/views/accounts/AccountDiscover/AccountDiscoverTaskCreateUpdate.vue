<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { periodicMeta } from '@/components/const'
import { ResourceSelect, TreeResourceSelect } from '@/components/Form/FormFields'
import i18n from '@/i18n/i18n'
import { GenericCreateUpdatePage } from '@/layout/components'

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
          type: 'resourceSelect',
          component: ResourceSelect,
          rules: [{ required: false }],
          el: {
            value: [],
            url: '/api/v1/assets/assets/?gather_accounts_enabled=true&fields_size=mini',
            resourceName: this.$t('Assets'),
            nodeFilter: {
              treeUrl: '/api/v1/assets/nodes/children/tree/?asset_amount=0&all=all',
              typeTreeUrl: '/api/v1/assets/nodes/category/tree/?count_resource=none',
              includeDescendants: true
            }
          }
        },
        nodes: {
          type: 'treeResourceSelect',
          component: TreeResourceSelect,
          rules: [{ required: false }],
          el: {
            value: [],
            url: '/api/v1/assets/nodes/?fields_size=mini',
            treeUrl: '/api/v1/assets/nodes/children/tree/?asset_amount=0&all=all',
            resourceName: this.$t('Nodes')
          }
        },
        recipients: {
          type: 'resourceSelect',
          component: ResourceSelect,
          label: i18n.t('Recipient'),
          helpText: i18n.t('OnlyMailSend'),
          el: {
            value: [],
            url: '/api/v1/users/users/?fields_size=mini',
            resourceName: this.$t('Users')
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
