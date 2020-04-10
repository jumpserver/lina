import i18n from '@/i18n/i18n'

export const Required = {
  required: true, message: i18n.t('common.' + 'This field is required'), trigger: 'blur'
}

export const RequiredChange = {
  required: true, message: i18n.t('common.' + 'This field is required'), trigger: 'change'
}

export default {
  Required,
  RequiredChange
}
