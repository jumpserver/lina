import i18n from '@/i18n/i18n'
import { AssetSelect } from '@/components'
import Select2 from '@/components/FormFields/Select2'
import { Required } from '@/components/DataForm/rules'

var validatorInterval = (rule, value, callback) => {
  if (parseInt(value) < 1) {
    return callback(new Error(i18n.t('xpack.ChangeAuthPlan.validatorMessage.EnsureThisValueIsGreaterThanOrEqualTo1')))
  }
  callback()
}

function generatePasswordRulesItemsFields() {
  const itemsFields = []
  const items = [
    { id: 'length', prop: 'length', label: i18n.t('xpack.ChangeAuthPlan.PasswordLength') }
  ]
  items.forEach((item, index, array) => {
    itemsFields.push({
      id: item.id, prop: item.prop, el: {}, attrs: {}, type: 'input', label: item.label, rules: [Required],
      hidden: (formValue) => { return ['random_one', 'random_all'].indexOf(formValue.password_strategy) === -1 }
    })
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
      return formValue.password_strategy !== 'custom'
    },
    rules: [
      { required: this.$route.meta.action === 'create', message: i18n.t('common.fieldRequiredError'), trigger: 'blur' }
    ]
  }

  const password_rules = {
    type: 'group',
    items: generatePasswordRulesItemsFields()
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

  const systemuser = {
    component: Select2,
    label: i18n.t('xpack.SystemUser'),
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
    password_rules: password_rules,
    nodes: nodes,
    is_periodic: is_periodic,
    crontab: crontab,
    interval: interval
  }
}

export default getFields
