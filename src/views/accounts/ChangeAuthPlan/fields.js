import i18n from '@/i18n/i18n'
import { AssetSelect, CronTab } from '@/components'
import { UpdateToken, TagInput } from '@/components/FormFields'
import { Required } from '@/components/DataForm/rules'

var validatorInterval = (rule, value, callback) => {
  if (parseInt(value) < 1) {
    return callback(new Error(i18n.t('xpack.ChangeAuthPlan.validatorMessage.EnsureThisValueIsGreaterThanOrEqualTo1')))
  }
  callback()
}

function getAssetPasswordRulesItems() {
  return [
    {
      id: 'length',
      prop: 'length',
      label: i18n.t('xpack.ChangeAuthPlan.PasswordLength'),
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

export const getFields = () => {
  return {
    assets: {
      type: 'assetSelect',
      component: AssetSelect,
      rules: [
        { required: false }
      ],
      label: i18n.t('xpack.Asset')
    },
    passphrase: {
      label: i18n.t('assets.Passphrase'),
      component: UpdateToken,
      hidden: ({ secret_strategy, secret_type }) => (secret_strategy !== 'specific' || secret_type !== 'ssh_key')
    },
    password_rules: {
      type: 'group',
      items: generatePasswordRulesItemsFields('asset')
    },
    recipients: {
      label: i18n.t('xpack.ChangeAuthPlan.Addressee'),
      helpText: i18n.t('xpack.ChangeAuthPlan.OnlyMailSend'),
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
    nodes: {
      label: i18n.t('xpack.Node'),
      el: {
        value: [],
        ajax: {
          url: '/api/v1/assets/nodes/',
          transformOption: (item) => {
            return { label: item.full_value, value: item.id }
          }
        }
      }
    },
    password_strategy: {
      label: i18n.t('xpack.ChangeAuthPlan.PasswordStrategy'),
      hidden: (formValue) => {
        return formValue.is_password === false
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
    secret_strategy: {
      type: 'radio-group',
      options: []
    },
    secret_type: {
      type: 'radio-group',
      options: []
    },
    accounts: {
      label: i18n.t('common.Username'),
      component: TagInput,
      helpText: i18n.t('xpack.ChangeAuthPlan.HelpText.UsernameOfCreateUpdatePage')
    },
    secret: {
      hidden: ({ secret_strategy, secret_type }) => (secret_strategy !== 'specific' || secret_type !== 'password')
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
    }
  }
}

export default getFields
