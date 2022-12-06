import i18n from '@/i18n/i18n'
import rules from '@/components/DataForm/rules'
import { JsonEditor } from '@/components/FormFields'
import { assetFieldsMeta } from '@/views/assets/const'
const assetMeta = assetFieldsMeta()

export const platformFieldsMeta = (vm) => {
  return {
    automation: {
      initial: {
        ansible_config: ''
      },
      fields: [
        'ansible_enabled', 'ansible_config',
        'ping_enabled', 'ping_method',
        'gather_facts_enabled', 'gather_facts_method',
        'push_account_enabled', 'push_account_method',
        'change_secret_enabled', 'change_secret_method',
        'verify_account_enabled', 'verify_account_method',
        'gather_accounts_enabled', 'gather_accounts_method'
      ],
      fieldsMeta: {
        ansible_config: {
          component: JsonEditor,
          hidden: (formValue) => !formValue['ansible_enabled']
        },
        gather_facts_enabled: {
          label: i18n.t('assets.CollectHardwareInfo')
        },
        ping_method: {},
        gather_facts_method: {},
        push_account_method: {},
        change_secret_method: {},
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
    protocols_enabled: {
      el: {
        disabled: false
      }
    },
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
      hidden: (formValue) => !formValue['protocols_enabled']
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
  initial['ansible_config'] = JSON.stringify(automation['ansible_config'])

  for (const item of autoFields) {
    const itemEnabledKey = item + '_enabled'
    const itemMethodKey = item + '_method'
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
    // 设置 method 类型和 options
    _.set(autoFieldsMeta, `${itemMethodKey}.type`, 'select')
    const methods = automation[itemMethodKey + 's'] || []
    autoFieldsMeta[itemMethodKey].options = methods.map(method => {
      return { value: method['id'], label: method['name'] }
    })
    _.set(initial, `${itemMethodKey}`, autoFieldsMeta[itemMethodKey].options[0]?.value)
  }
}
