import i18n from '@/i18n/i18n'
import TagInput from '@/components/Form/FormFields/TagInput.vue'
import { Required, RequiredChange } from '@/components/Form/DataForm/rules'

export const typeField = {
  type: 'select',
  disabled: true
}

export const hostsField = {
  component: TagInput,
  el: {
    replaceShowPassword: true,
    replaceRule: '(https?:\/\/[^:@]+:)([^@]+)(@.+)'
  },
  rules: [RequiredChange],
  helpText: i18n.t('EsUrl'),
  helpTextAsPlaceholder: false
}

export const indexField = {
  rules: [Required],
  helpText: i18n.t('EsIndex')
}

export const commentField = {
  component: 'el-input',
  el: {
    type: 'textarea'
  }
}
