import i18n from '@/i18n/i18n'
import { PasswordRule, Select2, TagInput, UpdateToken } from '@/components/Form/FormFields'
import { periodicMeta } from '@/components/const'

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
    pre_notify: {
      label: i18n.t('Pre Recipient'),
      component: Select2,
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
    post_notify: {
      label: i18n.t('Post Recipient'),
      component: Select2,
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
    ...periodicMeta,
    accounts: {
      label: i18n.t('Accounts'),
      component: TagInput
    }
  }
}

export default getChangeSecretFields
