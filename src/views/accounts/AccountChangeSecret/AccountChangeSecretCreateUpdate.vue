<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { getChangeSecretFields } from '@/views/accounts/AccountChangeSecret/fields'
import { AssetSelect, AutomationParams } from '@/components'

export default {
  name: 'AccountChangeSecretCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      node_ids: [],
      asset_ids: [],
      initial: {
        is_periodic: true,
        password_rules: {
          length: 30
        },
        interval: 24,
        accounts: [],
        secret_type: 'password',
        secret_strategy: 'specific'
      },
      url: '/api/v1/accounts/change-secret-automations/',
      encryptedFields: ['secret'],
      fields: [
        [this.$t('common.Basic'), ['name']],
        [this.$t('xpack.Asset'), ['accounts', 'assets', 'nodes']],
        [
          this.$t('accounts.AccountChangeSecret.SecretKeyStrategy'),
          [
            'secret_strategy', 'secret_type', 'secret',
            'password_rules', 'ssh_key_change_strategy',
            'ssh_key', 'passphrase', 'params'
          ]
        ],
        [this.$t('xpack.Timer'), ['is_periodic', 'crontab', 'interval']],
        [this.$t('common.Other'), ['is_active', 'recipients', 'comment']]
      ],
      fieldsMeta: {
        ...getChangeSecretFields(),
        assets: {
          label: this.$t('assets.Asset'),
          type: 'assetSelect',
          component: AssetSelect,
          rules: [
            { required: false }
          ],
          el: {
            baseUrl: '/api/v1/assets/assets/?change_secret_enabled=true'
          },
          on: {
            input: ([value]) => {
              this.asset_ids = value
            }
          }
        },
        nodes: {
          label: this.$t('assets.Node'),
          el: {
            value: [],
            ajax: {
              url: '/api/v1/assets/nodes/',
              transformOption: (item) => {
                return { label: item.full_value, value: item.id }
              }
            }
          },
          on: {
            input: ([value]) => {
              this.node_ids = value?.map(i => i.pk)
            }
          }
        },
        params: {
          component: AutomationParams,
          label: this.$t('assets.ChangeSecretParams'),
          el: {
            method: 'change_secret_method',
            assets: this.asset_ids,
            nodes: this.node_ids
          },
          helpText: this.$t('accounts.AccountChangeSecret.ParamsHelpText')
        }
      },
      createSuccessNextRoute: { name: 'AccountChangeSecretList' },
      updateSuccessNextRoute: { name: 'AccountChangeSecretList' },
      afterGetRemoteMeta: this.handleAfterGetRemoteMeta,
      cleanFormValue(data) {
        const secretType = data.secret_type || ''
        if (secretType !== 'password') {
          data.secret = data[secretType]
          delete data[secretType]
        }
        return data
      }
    }
  },
  watch: {
    node_ids: {
      handler(val) {
        this.fieldsMeta.params.el.nodes = val
      },
      deep: true
    },
    asset_ids: {
      handler(val) {
        this.fieldsMeta.params.el.assets = val
      },
      deep: true
    }
  },
  methods: {
    handleAfterGetRemoteMeta(meta) {
      const needSetOptionFields = [
        'secret_type', 'secret_strategy', 'ssh_key_change_strategy'
      ]
      for (const i of needSetOptionFields) {
        const field = this.fieldsMeta[i] || {}
        field.options = meta[i]?.choices || []
      }
    }
  }
}
</script>

<style scoped>

</style>
