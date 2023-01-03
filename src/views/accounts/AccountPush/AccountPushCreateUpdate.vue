<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { getChangeSecretFields } from '@/views/accounts/AccountChangeSecret/fields'

export default {
  name: 'AccountPushCreateUpdate',
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
      url: '/api/v1/accounts/push-account-automations/',
      fields: [
        [this.$t('common.Basic'), ['name']],
        ['触发方式', ['triggers']],
        [this.$t('assets.Account'), [
          'username', 'dynamic_username',
          'secret_type', 'secret_strategy', 'secret',
          'password_rules', 'ssh_key', 'passphrase'
        ]],
        [this.$t('common.Action'), ['action', 'ssh_key_change_strategy']],
        [this.$t('common.Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        ...getChangeSecretFields(),
        username: {
          hidden: (formValue) => formValue['dynamic_username']
        },
        ssh_key_change_strategy: {
          hidden: (formValue) => formValue['action'] !== 'create_and_push' ||
            formValue['secret_type'] !== 'ssh_key'
        }
      },
      afterGetRemoteMeta: this.handleAfterGetRemoteMeta,
      cleanFormValue(data) {
        const secretType = data.secret_type || ''
        if (secretType !== 'password') {
          data.secret = data[secretType]
          delete data[secretType]
        }
        console.log('Data: ', data)
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
