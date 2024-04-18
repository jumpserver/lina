<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import i18n from '@/i18n/i18n'
import { GenericCreateUpdatePage } from '@/layout/components'
import { getChangeSecretFields } from '@/views/accounts/AccountChangeSecret/fields'
import { AssetSelect, AutomationParams } from '@/components'

export default {
  name: 'AccountPushCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      node_ids: [],
      asset_ids: [],
      isAssetType: '',
      initial: {
        is_periodic: this.$store.getters.hasValidLicense,
        password_rules: {
          length: 30
        },
        interval: 24,
        secret_type: 'password',
        secret_strategy: 'specific'
      },
      url: '/api/v1/accounts/push-account-automations/',
      encryptedFields: ['secret'],
      fields: [
        [this.$t('common.Basic'), ['name']],
        [this.$t('xpack.Asset'), ['assets', 'nodes']],
        [
          this.$t('assets.Account'),
          [
            'accounts', 'secret_strategy', 'secret_type', 'secret',
            'password_rules', 'ssh_key_change_strategy', 'ssh_key',
            'passphrase', 'params'
          ]
        ],
        [this.$t('xpack.Timer'), ['is_periodic', 'crontab', 'interval']],
        [this.$t('common.Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        ...getChangeSecretFields(),
        assets: {
          label: i18n.t('xpack.Asset'),
          type: 'assetSelect',
          component: AssetSelect,
          rules: [
            { required: false }
          ],
          el: {
            baseUrl: '/api/v1/assets/assets/?push_account_enabled=true'
          },
          on: {
            input: ([value]) => {
              this.asset_ids = value
            }
          }
        },
        nodes: {
          label: this.$tc('assets.Node'),
          el: {
            multiple: true,
            ajax: {
              transformOption: (item) => {
                return { label: item['full_value'], value: item.id }
              },
              url: '/api/v1/assets/nodes/'
            }
          },
          on: {
            input: ([value]) => {
              this.node_ids = value?.map(i => i.pk)
            }
          }
        },
        username: {
          hidden: (formValue) => formValue['dynamic_username']
        },
        ssh_key_change_strategy: {
          hidden: (formValue) => formValue['action'] !== 'create_and_push' ||
            formValue['secret_type'] !== 'ssh_key'
        },
        triggers: {
          el: {
            readonly: true
          }
        },
        is_periodic: {
          type: 'switch',
          disabled: !this.$store.getters.hasValidLicense
        },
        params: {
          component: AutomationParams,
          label: this.$t('assets.PushParams'),
          el: {
            method: 'push_account_method',
            assets: this.asset_ids,
            nodes: this.node_ids
          },
          helpText: this.$t('accounts.AccountPush.ParamsHelpText')
        }
      },
      createSuccessNextRoute: { name: 'AccountPushList' },
      updateSuccessNextRoute: { name: 'AccountPushList' },
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
  computed: {
    isUpdate() {
      return this.$route.path.indexOf('/update') > -1
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
  mounted() {
    if (!this.$store.getters.hasValidLicense) {
      delete this.fields[3]
    }
  },
  methods: {
    hasType(type) {
      return this.isAssetType.indexOf(type) > -1
    },
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
