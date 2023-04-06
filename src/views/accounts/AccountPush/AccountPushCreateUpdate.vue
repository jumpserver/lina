<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { getChangeSecretFields } from '@/views/accounts/AccountChangeSecret/fields'
import { AssetSelect } from '@/components'
import i18n from '@/i18n/i18n'

export default {
  name: 'AccountPushCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
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
            'passphrase'
          ]
        ],
        [this.$t('xpack.Timer'), ['is_periodic', 'crontab', 'interval']],
        [this.$t('common.Other'), ['is_active', 'comment']]
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
            baseUrl: '/api/v1/assets/assets/?push_account_enabled=true'
          },
          label: i18n.t('xpack.Asset')
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
          hidden: !this.$store.getters.hasValidLicense
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
