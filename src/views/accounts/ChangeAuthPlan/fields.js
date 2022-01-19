import i18n from '@/i18n/i18n'
import { AssetSelect, CronTab, UploadKey } from '@/components'
import { Select2, UpdateToken } from '@/components/FormFields'
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
      id: 'length', prop: 'length', label: i18n.t('xpack.ChangeAuthPlan.PasswordLength'),
      rules: [Required], hidden: (formValue) => {
        return ['random_one', 'random_all'].indexOf(formValue.password_strategy) === -1 || !formValue.is_password
      }
    }
  ]
}

function getDatabasePasswordRulesItems() {
  return [
    {
      id: 'length', prop: 'length', label: i18n.t('xpack.ChangeAuthPlan.PasswordLength'),
      rules: [Required], hidden: (formValue) => {
        return ['random_one', 'random_all'].indexOf(formValue.password_strategy) === -1
      }
    },
    {
      id: 'symbol_set', prop: 'symbol_set',
      label: i18n.t('xpack.ChangeAuthPlan.SymbolSet'),
      helpText: i18n.t('xpack.ChangeAuthPlan.SymbolSetHelpText'),
      hidden: (formValue) => {
        return ['random_one', 'random_all'].indexOf(formValue.password_strategy) === -1
      }
    }
  ]
}

function generatePasswordRulesItemsFields(obType) {
  const itemsFields = []
  let items
  if (obType === 'asset') {
    items = getAssetPasswordRulesItems()
  } else if (obType === 'database') {
    items = getDatabasePasswordRulesItems()
  }
  items.forEach((item, index, array) => {
    itemsFields.push({
      id: item.id, prop: item.prop, el: {}, attrs: {}, type: 'input', label: item.label, rules: item.rules, helpText: item.helpText,
      hidden: item.hidden })
  })
  return itemsFields
}

function getFields() {
  const username = {
    helpText: i18n.t('xpack.ChangeAuthPlan.HelpText.UsernameOfCreateUpdatePage')
  }

  const assets = {
    type: 'assetSelect',
    component: AssetSelect,
    rules: [
      { required: false }
    ],
    label: i18n.t('xpack.Asset')
  }

  const database = {
    component: Select2,
    rules: [
      { required: true }
    ],
    label: i18n.t('xpack.Database'),
    el: {
      multiple: false,
      value: [],
      ajax: {
        url: '/api/v1/applications/applications/?category=db',
        transformOption: (item) => {
          return { label: item.name + '(' + item.type_display + ')', value: item.id, protocol: item.type }
        }
      }
    },
    on: {
      changeOptions: ([event], updateform) => {
        updateform({ systemuser: [] })
        this.fieldsMeta.systemuser.el.ajax.url = `/api/v1/assets/system-users/?protocol=${event[0].protocol}`
      }
    }
  }

  const password = {
    hidden: (formValue) => {
      return formValue.password_strategy !== 'custom' || formValue.is_password === false
    },
    rules: [
      { required: this.$route.meta.action === 'create', message: i18n.t('common.fieldRequiredError'), trigger: 'blur' }
    ]
  }

  const passphrase = {
    label: i18n.t('assets.Passphrase'),
    component: UpdateToken,
    hidden: (formValue) => {
      return formValue.is_ssh_key === false
    }
  }

  const asset_password_rules = {
    type: 'group',
    items: generatePasswordRulesItemsFields('asset')
  }

  const database_password_rules = {
    type: 'group',
    items: generatePasswordRulesItemsFields('database')
  }

  const private_key = {
    component: UploadKey,
    hidden: (formValue) => {
      return formValue.is_ssh_key === false
    },
    rules: [
      { required: this.$route.meta.action === 'create', message: this.$t('common.fieldRequiredError'), trigger: 'blur' }
    ]
  }

  const recipients = {
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
  }

  const nodes = {
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
  }

  const is_password = {
    label: i18n.t('xpack.ChangeAuthPlan.ChangePassword'),
    type: 'switch'
  }

  const is_ssh_key = {
    label: i18n.t('xpack.ChangeAuthPlan.ModifySSHKey'),
    type: 'switch'
  }

  const password_strategy = {
    label: i18n.t('xpack.ChangeAuthPlan.PasswordStrategy'),
    hidden: (formValue) => {
      return formValue.is_password === false
    }
  }

  const ssh_key_strategy = {
    label: i18n.t('xpack.ChangeAuthPlan.SecretKeyStrategy'),
    hidden: (formValue) => {
      return formValue.is_ssh_key === false
    }
  }

  const systemuser = {
    component: Select2,
    label: i18n.t('xpack.ChangeAuthPlan.SystemUser'),
    rules: [
      { required: true }
    ],
    el: {
      value: [],
      ajax: {
        url: '/api/v1/assets/system-users/',
        transformOption: (item) => {
          return { label: item.name + '(' + item.username + ')', value: item.id }
        }
      }
    }
  }

  const is_periodic = {
    type: 'switch'
  }

  const crontab = {
    type: 'cronTab',
    component: CronTab,
    label: i18n.t('xpack.RegularlyPerform'),
    hidden: (formValue) => {
      return formValue.is_periodic === false
    },
    helpText: i18n.t('xpack.HelpText.CrontabOfCreateUpdatePage')
  }

  const interval = {
    label: i18n.t('xpack.CyclePerform'),
    hidden: (formValue) => {
      return formValue.is_periodic === false
    },
    helpText: i18n.t('xpack.HelpText.IntervalOfCreateUpdatePage'),
    rules: [
      { validator: validatorInterval }
    ]
  }

  return {
    username: username,
    assets: assets,
    database: database,
    systemuser: systemuser,
    password: password,
    password_strategy: password_strategy,
    ssh_key_strategy: ssh_key_strategy,
    private_key: private_key,
    passphrase: passphrase,
    asset_password_rules: asset_password_rules,
    database_password_rules: database_password_rules,
    nodes: nodes,
    is_password: is_password,
    is_periodic: is_periodic,
    is_ssh_key: is_ssh_key,
    crontab: crontab,
    interval: interval,
    recipients: recipients
  }
}

export default getFields
