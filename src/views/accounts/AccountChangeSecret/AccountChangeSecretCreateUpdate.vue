<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { getFields } from '@/views/accounts/AccountChangeSecret/fields'

export default {
  name: 'AccountChangeSecretCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {
        is_periodic: true,
        password_rules: {
          length: 30
        },
        interval: 24,
        secret_type: 'password',
        secret_strategy: 'specific'
      },
      url: '/api/v1/accounts/change-secret-automations/',
      fields: [
        [this.$t('common.Basic'), ['name']],
        [this.$t('xpack.Asset'), ['accounts', 'assets', 'nodes']],
        [
          this.$t('xpack.ChangeAuthPlan.SecretKeyStrategy'),
          [
            'secret_strategy', 'secret_type', 'secret',
            'password_rules', 'ssh_key_change_strategy', 'ssh_key',
            'passphrase'
          ]
        ],
        [this.$t('xpack.Timer'), ['is_periodic', 'crontab', 'interval']],
        [this.$t('common.Other'), ['is_active', 'recipients', 'comment']]
      ],
      fieldsMeta: {
        ...getFields()
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
