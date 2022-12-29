<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { UpdateToken } from '@/components/FormFields'

export default {
  name: 'GatewayCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: { secret_type: 'password' },
      url: '/api/v1/accounts/account-templates/',
      hasDetailInMsg: false,
      fields: [
        [this.$t('common.Basic'), ['name', 'username', 'privileged']],
        [this.$t('assets.Secret'), [
          'secret_type', 'secret', 'ssh_key', 'token',
          'access_key', 'passphrase'
        ]],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        secret: {
          label: this.$t('assets.Password'),
          component: UpdateToken,
          hidden: (formValue) => formValue.secret_type !== 'password'
        },
        ssh_key: {
          label: this.$t('assets.PrivateKey'),
          el: {
            type: 'textarea',
            rows: 4
          },
          hidden: (formValue) => formValue.secret_type !== 'ssh_key'
        },
        passphrase: {
          label: this.$t('assets.Passphrase'),
          component: UpdateToken,
          hidden: (formValue) => formValue.secret_type !== 'ssh_key'
        },
        token: {
          label: this.$t('assets.Token'),
          el: {
            type: 'textarea',
            rows: 4
          },
          hidden: (formValue) => formValue.secret_type !== 'token'
        },
        access_key: {
          label: this.$t('assets.AccessKey'),
          el: {
            type: 'textarea',
            rows: 4
          },
          hidden: (formValue) => formValue.secret_type !== 'access_key'
        }
      },
      cleanFormValue(value) {
        Object.keys(value).forEach((item, index, arr) => {
          if (['ssh_key', 'token', 'api_key'].includes(item)) {
            value['secret'] = value[item]
            delete value[item]
          }
        })
        return value
      },
      createSuccessNextRoute: { name: 'AccountTemplateList' },
      updateSuccessNextRoute: { name: 'AccountTemplateList' }
    }
  }
}
</script>

<style>

</style>
