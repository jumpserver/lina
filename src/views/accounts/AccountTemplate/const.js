import { getUuidUpdateFromUrl } from '@/utils/common'
import { UpdateToken } from '@/components/FormFields'
import Select2 from '@/components/FormFields/Select2'
import AccountAutoPush from '@/views/accounts/AccountPush/AccountAutoPush.vue'

export const templateFields = (vm) => {
  return [
    [vm.$t('common.Basic'), ['name', 'username', 'privileged', 'su_from']],
    [vm.$t('assets.Secret'), [
      'secret_strategy', 'secret_type', 'secret',
      'ssh_key', 'token', 'access_key', 'passphrase'
    ]],
    [vm.$t('accounts.AutoPush'), [
      'auto_push', 'platforms', 'push_params'
    ]],
    [vm.$t('common.Other'), ['comment']]
  ]
}

export const templateFieldsMeta = (vm) => {
  const id = getUuidUpdateFromUrl(vm.$route.path)
  const platformIds = []
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
      hidden: (formValue) => {
        return formValue.secret_type !== 'password' || formValue.secret_strategy === 'random'
      }
    },
    ssh_key: {
      label: vm.$t('assets.PrivateKey'),
      el: {
        type: 'textarea',
        rows: 4
      },
      hidden: (formValue) => formValue.secret_type !== 'ssh_key' || formValue.secret_strategy === 'random'
    },
    passphrase: {
      label: vm.$t('assets.Passphrase'),
      component: UpdateToken,
      hidden: (formValue) => formValue.secret_type !== 'ssh_key' || formValue.secret_strategy === 'random'
    },
    token: {
      label: vm.$t('assets.Token'),
      el: {
        type: 'textarea',
        rows: 4
      },
      hidden: (formValue) => formValue.secret_type !== 'token' || formValue.secret_strategy === 'random'
    },
    access_key: {
      label: vm.$t('assets.AccessKey'),
      el: {
        type: 'textarea',
        rows: 4
      },
      hidden: (formValue) => formValue.secret_type !== 'access_key' || formValue.secret_strategy === 'random'
    },
    platforms: {
      el: {
        multiple: true,
        ajax: {
          url: `/api/v1/assets/platforms/`,
          transformOption: (item) => {
            return { label: item.name, value: item.id }
          }
        }
      },
      on: {
        change: ([event], updateForm) => {
          platformIds.splice(0, platformIds.length)
          platformIds.push(...event)
        }
      },
      hidden: (formValue) => {
        return !formValue['auto_push']
      }
    },
    push_params: {
      component: AccountAutoPush,
      el: {
        platforms: platformIds
      },
      hidden: (formValue) => {
        return !formValue['auto_push']
      }
    }
  }
}
