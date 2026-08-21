import i18n from '@/i18n/i18n'
import rules from '@/components/Form/DataForm/rules'
import { JsonEditor } from '@/components/Form/FormFields'
import { assetFieldsMeta } from '@/views/assets/const'
import AutomationMethodField from './AutomationMethodField'

const needSettingParamsFields = ['push_account', 'change_secret']

const automationParamsTitleKeys = {
  ping: 'PingParams',
  gather_facts: 'GatherFactsParams',
  change_secret: 'ChangeSecretParams',
  push_account: 'PushParams',
  verify_account: 'VerifyAccountParams',
  gather_accounts: 'GatherAccountsParams',
  remove_account: 'RemoveAccountParams'
}

export const platformFieldsMeta = (vm) => {
  const assetMeta = assetFieldsMeta(vm)
  return {
    automation: {
      initial: {
        ansible_config: ''
      },
      fields: [
        'ansible_enabled',
        'ansible_config',
        'ping_enabled',
        'ping_method',
        'ping_params',
        'gather_facts_enabled',
        'gather_facts_method',
        'gather_facts_params',
        'change_secret_enabled',
        'change_secret_method',
        'change_secret_params',
        'push_account_enabled',
        'push_account_method',
        'push_account_params',
        'verify_account_enabled',
        'verify_account_method',
        'verify_account_params',
        'gather_accounts_enabled',
        'gather_accounts_method',
        'gather_accounts_params',
        'remove_account_enabled',
        'remove_account_method',
        'remove_account_params'
      ],
      fieldsMeta: {
        ansible_config: {
          component: JsonEditor,
          hidden: (formValue) => !formValue['ansible_enabled']
        },
        gather_facts_enabled: {},
        remove_account_enabled: {},
        ping_method: {},
        ping_params: {
          label: ''
        },
        gather_facts_method: {},
        push_account_method: {},
        remove_account_method: {},
        remove_account_params: {},
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
            method: 'change_secret_posix'
          }
        },
        verify_account_method: {}
      }
    },
    category_type: {
      type: 'cascader',
      label: i18n.t('Type'),
      rules: [rules.Required],
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
    gateway_enabled: {
      el: {
        disabled: false
      }
    },
    ds_enabled: {
      el: {
        disabled: false
      }
    },

    protocols: {
      label: i18n.t('SupportedProtocol'),
      ...assetMeta.protocols,
      el: {
        choices: []
      },
      helpText: i18n.t('SupportedProtocolHelpText')
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
    .filter((item) => item.endsWith('_method'))
    .map((item) => item.replace('_method', ''))

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
    _.set(autoFieldsMeta, `${itemEnabledKey}.attrs.class`, 'item-enable')
    // 设置 enableMethod className
    _.set(autoFieldsMeta, `${itemMethodKey}.attrs.class`, 'item-method')
    // 设置 enableParams Hidden
    // params 字段不再单独渲染(齿轮按钮已并入 method 的组合组件),但其值仍需随表单提交,
    // 因此恒隐藏其表单行、只保留取值。
    _.set(autoFieldsMeta, `${itemParamsKey}.hidden`, () => true)
    // method 字段改用组合组件:el-select 与参数设置按钮拼成一体的 input-group
    const methods = automation[itemMethodKey + 's'] || []
    const options = methods.map((method) => {
      return { value: method['id'], label: method['name'] }
    })
    _.set(autoFieldsMeta, `${itemMethodKey}.component`, AutomationMethodField)
    _.set(autoFieldsMeta, `${itemMethodKey}.el.options`, options)
    _.set(
      autoFieldsMeta,
      `${itemMethodKey}.el.paramsUrl`,
      '/api/v1/assets/platform-automation-methods/'
    )
    _.set(autoFieldsMeta, `${itemMethodKey}.el.paramsTitle`, vm.$t(automationParamsTitleKeys[item]))
    _.set(autoFieldsMeta, `${itemMethodKey}.el.paramsKey`, itemParamsKey)
    const existingParams = vm.object?.automation?.[itemParamsKey] || initial[itemParamsKey] || {}
    _.set(autoFieldsMeta, `${itemMethodKey}.el.paramsValue`, existingParams)
    if (
      existingParams &&
      typeof existingParams === 'object' &&
      Object.keys(existingParams).length
    ) {
      initial[itemParamsKey] = existingParams
    }
    if (!initial[itemMethodKey]) {
      _.set(initial, `${itemMethodKey}`, options[0]?.value)
    }
  }
}

export const updateAutomationParams = (vm, obj) => {
  const auto = obj?.automation || {}
  const autoFieldsMeta = vm.fieldsMeta.automation.fieldsMeta
  vm.fieldsMeta.automation.fields
    .filter((item) => item.endsWith('_method'))
    .forEach((itemMethodKey) => {
      const prefix = itemMethodKey.replace('_method', '')
      const params = auto[`${prefix}_params`]
      if (params && typeof params === 'object' && Object.keys(params).length) {
        _.set(autoFieldsMeta, `${itemMethodKey}.el.paramsValue`, params)
      }
    })
  needSettingParamsFields.forEach((v) => {
    const value = _.get(auto, `${v}_method`)
    _.set(autoFieldsMeta, `${v}_params.el.method`, value)
  })
}
