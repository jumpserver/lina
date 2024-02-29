import { getUuidUpdateFromUrl } from '@/utils/common'
import { PasswordRule, UpdateToken, UploadSecret } from '@/components/Form/FormFields'
import Select2 from '@/components/Form/FormFields/Select2'
import AutomationParams from '@/components/Apps/AutomationParams'
import i18n from '@/i18n/i18n'

export const templateFields = (vm) => {
  return [
    [vm.$t('common.Basic'), ['name', 'username', 'privileged', 'su_from']],
    [vm.$t('assets.Secret'), [
      'secret_type', 'secret_strategy', 'password_rules',
      'secret', 'ssh_key', 'token', 'access_key', 'passphrase', 'api_key'
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
  const canRandomSecretTypes = ['password', 'ssh_key']
  const autoPushEl = { disabled: false }
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
    secret_type: {
      on: {
        change: ([event], updateForm) => {
          if (!canRandomSecretTypes.includes(event)) {
            updateForm({ secret_strategy: 'specific' })
            updateForm({ auto_push: false })
            autoPushEl.disabled = true
          } else {
            autoPushEl.disabled = false
          }
        }
      }
    },
    secret_strategy: {
      hidden: (formValue) => {
        return !canRandomSecretTypes.includes(formValue.secret_type)
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
      component: UploadSecret,
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
    api_key: {
      label: vm.$t('assets.ApiKey'),
      el: {
        type: 'textarea',
        rows: 4
      },
      hidden: (formValue) => formValue.secret_type !== 'api_key' || formValue.secret_strategy === 'random'
    },
    password_rules: {
      component: PasswordRule,
      label: i18n.t('accounts.AccountChangeSecret.PasswordRule'),
      hidden: ({ secret_strategy, secret_type }) => (secret_strategy === 'specific' || secret_type !== 'password')
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
        input: ([event], updateForm) => {
          platformIds.splice(0, platformIds.length)
          platformIds.push(...event)
        }
      },
      hidden: (formValue) => {
        return !formValue['auto_push']
      }
    },
    auto_push: {
      el: autoPushEl
    },
    push_params: {
      component: AutomationParams,
      el: {
        platforms: platformIds,
        method: 'push_account_method'
      },
      hidden: (formValue) => {
        return !formValue['auto_push']
      }
    }
  }
}
