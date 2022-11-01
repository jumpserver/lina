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
      initial: {},
      url: '/api/v1/assets/account-templates/',
      hasDetailInMsg: false,
      fields: [
        [this.$t('common.Basic'), ['name', 'username', 'privileged']],
        [this.$t('assets.Secret'), ['secret_type', 'secret', 'ssh_key', 'token', 'access_key', 'passphrase']],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        secret_type: {
        },
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
          label: 'Passphrase',
          component: UpdateToken,
          hidden: (formValue) => formValue.secret_type !== 'ssh_key'
        },
        token: {
          label: 'Token',
          el: {
            type: 'textarea',
            rows: 4
          },
          hidden: (formValue) => formValue.secret_type !== 'token'
        },
        access_key: {
          label: 'access key',
          el: {
            type: 'textarea',
            rows: 4
          },
          hidden: (formValue) => formValue.secret_type !== 'access_key'
        }
      },
      createSuccessNextRoute: { name: 'AccountTemplateList' },
      updateSuccessNextRoute: { name: 'AccountTemplateList' }
    }
  }
}
</script>

<style>

</style>
