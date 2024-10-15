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
        is_periodic: false,
        password_rules: {
          length: 16
        },
        interval: 24,
        accounts: [],
        secret_type: 'password',
        secret_strategy: 'specific',
        ssh_key_change_strategy: 'set_jms'
      },
      url: '/api/v1/accounts/change-secret-automations/',
      encryptedFields: ['secret'],
      fields: [
        [this.$t('Basic'), ['name']],
        [this.$t('Asset'), ['accounts', 'assets', 'nodes']],
        [
          this.$t('SecretKeyStrategy'),
          [
            'secret_strategy', 'secret_type', 'secret',
            'password_rules', 'ssh_key_change_strategy',
            'ssh_key', 'passphrase'
          ]
        ],
        [this.$t('Automations'), ['params']],
        [this.$t('Periodic'), ['is_periodic', 'interval', 'crontab']],
        [this.$t('Notification'), ['recipients']],
        [this.$t('Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        ...getChangeSecretFields(),
        assets: {
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
          el: {
            method: 'change_secret_method',
            assets: this.asset_ids,
            nodes: this.node_ids
          }
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
