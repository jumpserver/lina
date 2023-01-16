import { UpdateToken } from '@/components/FormFields'

export const templateFields = (vm) => {
  return [
    [vm.$t('common.Basic'), ['name', 'username', 'privileged']],
    [vm.$t('assets.Secret'), [
      'secret_type', 'secret', 'ssh_key', 'token',
      'access_key', 'passphrase'
    ]],
    [vm.$t('common.Other'), ['comment']]
  ]
}

export const templateFieldsMeta = (vm) => {
  return {
    secret: {
      label: vm.$t('assets.Password'),
      component: UpdateToken,
      hidden: (formValue) => formValue.secret_type !== 'password'
    },
    ssh_key: {
      label: vm.$t('assets.PrivateKey'),
      el: {
        type: 'textarea',
        rows: 4
      },
      hidden: (formValue) => formValue.secret_type !== 'ssh_key'
    },
    passphrase: {
      label: vm.$t('assets.Passphrase'),
      component: UpdateToken,
      hidden: (formValue) => formValue.secret_type !== 'ssh_key'
    },
    token: {
      label: vm.$t('assets.Token'),
      el: {
        type: 'textarea',
        rows: 4
      },
      hidden: (formValue) => formValue.secret_type !== 'token'
    },
    access_key: {
      label: vm.$t('assets.AccessKey'),
      el: {
        type: 'textarea',
        rows: 4
      },
      hidden: (formValue) => formValue.secret_type !== 'access_key'
    }
  }
}
