import i18n from '@/i18n/i18n'
import rules from '@/components/Form/DataForm/rules'
import { JsonEditor } from '@/components/Form/FormFields'
import { assetFieldsMeta } from '@/views/assets/const'
import AutomationParamsSetting from './AutomationParamsSetting'

const needSettingParamsFields = ['push_account', 'change_secret']

export const platformFieldsMeta = (vm) => {
  const assetMeta = assetFieldsMeta(vm)
  return {
    automation: {
      initial: {
        ansible_config: ''
      },
      fields: [
        'ansible_enabled', 'ansible_config',
        'ping_enabled', 'ping_method', 'ping_params',
        'gather_facts_enabled', 'gather_facts_method', 'gather_facts_params',
        'change_secret_enabled', 'change_secret_method', 'change_secret_params',
        'push_account_enabled', 'push_account_method', 'push_account_params',
        'verify_account_enabled', 'verify_account_method', 'verify_account_params',
        'gather_accounts_enabled', 'gather_accounts_method', 'gather_accounts_params'
      ],
      fieldsMeta: {
        ansible_config: {
          component: JsonEditor,
          hidden: (formValue) => !formValue['ansible_enabled']
        },
        gather_facts_enabled: {},
        ping_method: {},
        ping_params: {
          label: ''
        },
        gather_facts_method: {},
        push_account_method: {},
        push_account_params: {
          label: ''
        },
        change_secret_method: {
          on: {
            change: ([val]) => {
              vm.fieldsMeta.automation.fieldsMeta.change_secret_params.el.method = val
            }
          }
        },
        change_secret_params: {
          label: '',
          el: {
            title: vm.$t('assets.ChangeSecretParams'),
            method: 'change_secret_posix'
          }
        },
        verify_account_method: {}
      }
    },
    category_type: {
      type: 'cascader',
      label: i18n.t('assets.Type'),
      rules: [
        rules.Required
      ],
      el: {
        multiple: false,
        options: [],
        disabled: true
      },
      hidden: (formValue) => {
        if (formValue?.category_type?.[0] === undefined) {
          formValue.category_type = vm.initial.category_type
        }
      }
    },
    charset: {},
    domain_enabled: {
      el: {
        disabled: false
      }
    },
    protocols: {
      label: i18n.t('assets.SupportedProtocol'),
      ...assetMeta.protocols,
      el: {
        choices: []
      },
      helpText: i18n.t('assets.SupportedProtocolHelpText')
    },
    su_method: {
      type: 'select',
      options: [],
      hidden: (form) => !form['su_enabled']
    }
  }
}

export const setAutomations = (vm) => {
  const automation = vm.defaultOptions.automation || {}
  const autoFieldsMeta = vm.fieldsMeta.automation.fieldsMeta
  const autoFields = vm.fieldsMeta.automation.fields
    .filter(item => item.endsWith('_method'))
    .map(item => item.replace('_method', ''))

  const initial = vm.initial.automation || {}
  initial['ansible_enabled'] = automation['ansible_enabled']
  initial['ansible_config'] = automation['ansible_config']

  if (initial['ansible_enabled'] === false) {
    _.set(autoFieldsMeta, `ansible_enabled.el.disabled`, true)
  }

  for (const item of autoFields) {
    const itemEnabledKey = item + '_enabled'
    const itemMethodKey = item + '_method'
    const itemParamsKey = item + '_params'
    const itemEnabled = automation[itemEnabledKey]
    // 设置 enableKey disabled 和 默认值
    if (itemEnabled === false) {
      initial[itemEnabledKey] = false
      _.set(autoFieldsMeta, `${itemEnabledKey}.el.disabled`, true)
    } else {
      initial[itemEnabledKey] = true
    }

    // 设置 enableKey Hidden
    _.set(autoFieldsMeta, `${itemEnabledKey}.hidden`, (formValue) => {
      return !formValue['ansible_enabled']
    })
    // 设置 enableMethod Hidden
    _.set(autoFieldsMeta, `${itemMethodKey}.hidden`, (formValue) => {
      return !formValue[itemEnabledKey] || !formValue['ansible_enabled']
    })
    // 设置 enableMethod className
    _.set(autoFieldsMeta, `${itemMethodKey}.attrs.class`, 'itemMethodKey')
    // 设置 enableParams Hidden
    _.set(autoFieldsMeta, `${itemParamsKey}.hidden`, (formValue) => {
      return !formValue[itemEnabledKey] || !formValue['ansible_enabled']
    })
    // 设置 method 类型和 options
    _.set(autoFieldsMeta, `${itemMethodKey}.type`, 'select')
    const methods = automation[itemMethodKey + 's'] || []
    autoFieldsMeta[itemMethodKey].options = methods.map(method => {
      return { value: method['id'], label: method['name'] }
    })
    _.set(initial, `${itemMethodKey}`, autoFieldsMeta[itemMethodKey].options[0]?.value)

    // 设置 params 类型字段的组件和组件参数
    // if (needSettingParamsFields.includes(item)) {
    // 设置 enableParams label
    _.set(autoFieldsMeta, `${itemParamsKey}.label`, '')
    // 设置 enableParams className
    _.set(autoFieldsMeta, `${itemParamsKey}.attrs.class`, 'itemParamsKey')
    _.set(autoFieldsMeta, `${itemParamsKey}.component`, AutomationParamsSetting)
    _.set(autoFieldsMeta, `${itemParamsKey}.el.method`, initial[itemMethodKey])
    // }
  }
}

export const updateAutomationParams = (vm, obj) => {
  needSettingParamsFields.forEach((v) => {
    const value = _.get(obj.automation, `${v}_method`)
    _.set(vm.fieldsMeta.automation.fieldsMeta, `${v}_params.el.method`, value)
  })
}
