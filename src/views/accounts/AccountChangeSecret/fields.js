import i18n from '@/i18n/i18n'
import { PasswordRule, TagInput, UpdateToken } from '@/components/Form/FormFields'
import { crontab, interval, is_periodic } from '../const'

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
      el: {
        autocomplete: 'new-password'
      },
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
      label: i18n.t('Recipient'),
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
    interval,
    crontab,
    is_periodic,
    accounts: {
      label: i18n.t('Accounts'),
      component: TagInput,
      helpText: i18n.t('ChangeSecretAccountHelpText')
    }
  }
}

export default getChangeSecretFields
