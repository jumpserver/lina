<template>
  <GenericCreateUpdatePage v-bind="formConfig" @input="testAccounts = $event.test_accounts" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { NodeSelect, ResourceSelect, TagInput } from '@/components/Form/FormFields'
import { periodicMeta } from '@/components/const'
import { connectivityMixin, getConnectivityConfig } from './config'

export default {
  name: 'ConnectivityCreateUpdate',
  components: { GenericCreateUpdatePage },
  mixins: [connectivityMixin],
  data() {
    return { testAccounts: false, isUpdate: false }
  },
  computed: {
    formConfig() {
      const config = this.connectivity
      const nextRoute = { name: 'ConnectivityList', query: { tab: config.taskTab } }
      return {
        url: config.url,
        hasDetailInMsg: false,
        initial: { is_periodic: false, interval: 24, is_active: true, accounts: [] },
        fields: [
          [this.$t('Basic'), ['name', 'test_accounts']],
          [this.$t('ConnectivityTargets'), ['assets', 'nodes', 'accounts']],
          [this.$t('Periodic'), ['is_periodic', 'interval', 'crontab']],
          [this.$t('Other'), ['is_active', 'comment']]
        ],
        fieldsMeta: {
          ...periodicMeta,
          test_accounts: {
            type: 'radio-group',
            label: this.$t('Type'),
            options: [
              { label: this.$t('Asset'), value: false },
              { label: this.$t('Account'), value: true }
            ],
            el: {
              ariaLabel: this.$t('Type'),
              disabled:
                this.isUpdate ||
                !['account', 'asset'].every((type) =>
                  this.$hasPerm(getConnectivityConfig(type).addPermission)
                )
            }
          },
          assets: {
            component: ResourceSelect,
            rules: [{ required: false }],
            el: {
              value: [],
              url: '/api/v1/assets/assets/?fields_size=mini',
              queryParams: () => ({
                [getConnectivityConfig(this.testAccounts ? 'account' : 'asset').enabledFilter]: true
              }),
              resourceName: this.$t('Assets'),
              nodeFilter: {
                treeUrl: '/api/v1/assets/nodes/children/tree/?asset_amount=0&all=all',
                typeTreeUrl: '/api/v1/assets/nodes/category/tree/?count_resource=none',
                includeDescendants: true
              }
            }
          },
          nodes: {
            component: NodeSelect,
            rules: [{ required: false }],
            el: {
              value: [],
              url: '/api/v1/assets/nodes/?fields_size=mini',
              treeUrl: '/api/v1/assets/nodes/children/tree/?asset_amount=0&all=all',
              resourceName: this.$t('Nodes')
            }
          },
          accounts: {
            label: this.$t('Accounts'),
            component: TagInput,
            rules: [{ required: false }],
            helpText: this.$t('ConnectivityAccountsHelp'),
            hidden: (values) => !values.test_accounts
          }
        },
        createSuccessNextRoute: nextRoute,
        updateSuccessNextRoute: nextRoute,
        afterGetFormValue: (values) => {
          this.isUpdate = !!values.id
          this.testAccounts = config.type === 'account'
          return { ...values, accounts: values.accounts || [], test_accounts: this.testAccounts }
        },
        cleanFormValue(values) {
          values.interval = values.interval || null
          return values
        },
        performSubmit(values) {
          const { test_accounts, ...payload } = values
          const type = this.method === 'post' ? (test_accounts ? 'account' : 'asset') : config.type
          const url = this.method === 'post' ? getConnectivityConfig(type).url : this.iUrl
          if (type === 'account') payload.accounts = payload.accounts || []
          else delete payload.accounts
          return this.$axios[this.method](url, payload)
        }
      }
    }
  }
}
</script>
