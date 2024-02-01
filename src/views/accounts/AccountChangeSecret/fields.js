import i18n from '@/i18n/i18n'
import { CronTab } from '@/components'
import { PasswordRule, TagInput, UpdateToken } from '@/components/Form/FormFields'

const validatorInterval = (rule, value, callback) => {
  if (parseInt(value) < 1) {
    return callback(new Error(i18n.t('EnsureThisValueIsGreaterThanOrEqualTo1')))
  }
  callback()
}

export const getChangeSecretFields = () => {
  return {
    secret_type: {
      type: 'radio-group',
      options: []
    },
    secret_strategy: {
      type: 'radio-group',
      options: [],
      label: i18n.t('PasswordStrategy'),
      on: ([value], updateForm) => {
      }
    },
    secret: {
      label: i18n.t('Password'),
      hidden: ({ secret_strategy, secret_type }) => {
        return secret_strategy !== 'specific' || secret_type !== 'password'
      }
    },
    ssh_key: {
      label: i18n.t('PrivateKey'),
      el: {
        type: 'textarea',
        rows: 4
      },
      hidden: ({ secret_strategy, secret_type }) => (secret_strategy !== 'specific' || secret_type !== 'ssh_key')
    },
    ssh_key_change_strategy: {
      type: 'radio-group',
      options: [],
      hidden: ({ secret_strategy, secret_type }) => (secret_type !== 'ssh_key')
    },
    passphrase: {
      label: i18n.t('Passphrase'),
      component: UpdateToken,
      hidden: ({ secret_strategy, secret_type }) => {
        return (secret_strategy !== 'specific' || secret_type !== 'ssh_key')
      }
    },
    password_rules: {
      component: PasswordRule,
      label: i18n.t('PasswordRule'),
      hidden: ({ secret_strategy, secret_type }) => (secret_strategy === 'specific' || secret_type !== 'password')
    },
    recipients: {
      label: i18n.t('Addressee'),
      helpText: i18n.t('OnlyMailSend'),
      el: {
        value: [],
        ajax: {
          url: '/api/v1/users/users/?fields_size=mini',
          transformOption: (item) => {
            return { label: item.name + '(' + item.username + ')', value: item.id }
          }
        }
      }
    },
    is_periodic: {
      type: 'switch'
    },
    crontab: {
      type: 'cronTab',
      component: CronTab,
      hidden: (formValue) => {
        return formValue.is_periodic === false
      },
      helpText: i18n.t('CrontabOfCreateUpdatePage')
    },
    interval: {
      hidden: (formValue) => {
        return formValue.is_periodic === false
      },
      helpText: i18n.t('IntervalOfCreateUpdatePage'),
      rules: [
        { validator: validatorInterval }
      ]
    },
    accounts: {
      label: i18n.t('Username'),
      component: TagInput
    }
  }
}

export default getChangeSecretFields
