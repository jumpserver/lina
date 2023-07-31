import { getUuidUpdateFromUrl } from '@/utils/common'
import { UpdateToken } from '@/components/Form/FormFields'
import Select2 from '@/components/Form/FormFields/Select2'

export const templateFields = (vm) => {
  return [
    [vm.$t('common.Basic'), ['name', 'username', 'privileged', 'su_from']],
    [vm.$t('assets.Secret'), [
      'secret_type', 'secret', 'ssh_key', 'token',
      'access_key', 'passphrase', 'api_key'
    ]],
    [vm.$t('common.Other'), ['comment']]
  ]
}

export const templateFieldsMeta = (vm) => {
  const id = getUuidUpdateFromUrl(vm.$route.path)
  return {
    su_from: {
      component: Select2,
      el: {
        multiple: false,
        clearable: true,
        ajax: {
          url: `/api/v1/accounts/account-templates/su-from-account-templates/?${id ? 'template_id=' + id : ''}`,
          transformOption: (item) => {
            return { label: `${item.name}(${item.username})`, value: item.id }
          }
        }
      }
    },
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
    },
    api_key: {
      label: vm.$t('assets.ApiKey'),
      el: {
        type: 'textarea',
        rows: 4
      },
      hidden: (formValue) => formValue.secret_type !== 'api_key'
    }
  }
}
