import i18n from '@/i18n/i18n'
import { CronTab } from '@/components'
import { TagInput, UpdateToken } from '@/components/FormFields'
import { Required } from '@/components/DataForm/rules'

var validatorInterval = (rule, value, callback) => {
  if (parseInt(value) < 1) {
    return callback(new Error(i18n.t('accounts.AccountChangeSecret.validatorMessage.EnsureThisValueIsGreaterThanOrEqualTo1')))
  }
  callback()
}

function getAssetPasswordRulesItems() {
  return [
    {
      id: 'length',
      prop: 'length',
      label: i18n.t('accounts.AccountChangeSecret.PasswordLength'),
      rules: [Required],
      hidden: ({ secret_strategy, secret_type }) => (secret_strategy === 'specific' || secret_type !== 'password')
    }
  ]
}

function generatePasswordRulesItemsFields(obType) {
  const itemsFields = []
  let items
  if (obType === 'asset') {
    items = getAssetPasswordRulesItems()
  }
  items.forEach((item, index, array) => {
    itemsFields.push({
      id: item.id,
      prop: item.prop,
      el: {},
      attrs: {},
      type: 'input',
      label: item.label,
      rules: item.rules,
      helpText: item.helpText,
      hidden: item.hidden
    })
  })
  return itemsFields
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
      label: i18n.t('accounts.AccountChangeSecret.PasswordStrategy'),
      on: ([value], updateForm) => {
      }
    },
    secret: {
      label: i18n.t('assets.Password'),
      hidden: ({ secret_strategy, secret_type }) => {
        return secret_strategy !== 'specific' || secret_type !== 'password'
      }
    },
    ssh_key: {
      label: i18n.t('assets.PrivateKey'),
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
      label: i18n.t('assets.Passphrase'),
      component: UpdateToken,
      hidden: ({ secret_strategy, secret_type }) => {
        return (secret_strategy !== 'specific' || secret_type !== 'ssh_key')
      }
    },
    password_rules: {
      type: 'group',
      items: generatePasswordRulesItemsFields('asset')
    },
    recipients: {
      label: i18n.t('accounts.AccountChangeSecret.Addressee'),
      helpText: i18n.t('accounts.AccountChangeSecret.OnlyMailSend'),
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
      label: i18n.t('xpack.RegularlyPerform'),
      hidden: (formValue) => {
        return formValue.is_periodic === false
      },
      helpText: i18n.t('xpack.HelpText.CrontabOfCreateUpdatePage')
    },
    interval: {
      label: i18n.t('xpack.CyclePerform'),
      hidden: (formValue) => {
        return formValue.is_periodic === false
      },
      helpText: i18n.t('xpack.HelpText.IntervalOfCreateUpdatePage'),
      rules: [
        { validator: validatorInterval }
      ]
    },
    accounts: {
      label: i18n.t('common.Username'),
      component: TagInput
    }
  }
}

export default getChangeSecretFields
