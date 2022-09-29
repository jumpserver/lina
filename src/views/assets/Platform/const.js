import i18n from '@/i18n/i18n'
import rules from '@/components/DataForm/rules'
import { JsonEditor } from '@/components/FormFields'
import { assetFieldsMeta } from '@/views/assets/const'
const assetMeta = assetFieldsMeta()

export const fieldsMeta = {
  automation: {
    initial: {
      ansible_config: ''
    },
    fields: [
      'ansible_enabled', 'ansible_config',
      'ping_enabled', 'ping_method',
      'gather_facts_enabled', 'gather_facts_method',
      'create_account_enabled', 'create_account_method',
      'change_password_enabled', 'change_password_method',
      'verify_account_enabled', 'verify_account_method'
    ],
    fieldsMeta: {
      ansible_config: {
        component: JsonEditor,
        el: {
          value: '{}'
        },
        hidden: (formValue) => !formValue['ansible_enabled']
      },
      ping_method: {},
      gather_facts_method: {},
      create_account_method: {},
      change_password_method: {},
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
      if (formValue.category_type[0] === undefined) {
        formValue.category_type = this.initial.category_type
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
    hidden: (form) => !form['su_enabled']
  }
}
