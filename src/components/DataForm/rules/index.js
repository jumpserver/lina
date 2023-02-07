import i18n from '@/i18n/i18n'

export const Required = {
  required: true, message: i18n.t('common.fieldRequiredError'), trigger: 'blur'
}

export const RequiredChange = {
  required: true, message: i18n.t('common.fieldRequiredError'), trigger: 'change'
}

export const EmailCheck = {
  type: 'email',
  message: i18n.t('common.InputEmailAddress'),
  trigger: ['blur', 'change']
}

export const IpCheck = {
  required: true,
  validator: (rule, value, callback) => {
    value = value?.trim()
    if (/^[\w://.?]+$/.test(value)) {
      callback()
    } else {
      callback(new Error(i18n.t('common.FormatError')))
    }
  },
  trigger: ['blur', 'change']
}

export const specialEmojiCheck = {
  validator: (rule, value, callback) => {
    value = value?.trim()
    if (/[\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/.test(value)) {
      callback(new Error(i18n.t('common.NotSpecialEmoji')))
    } else {
      callback()
    }
  },
  trigger: ['blur', 'change']
}

export default {
  IpCheck,
  Required,
  RequiredChange,
  EmailCheck,
  specialEmojiCheck
}

export const JsonRequired = {
  required: true,
  trigger: 'change',
  validator: (rule, value, callback) => {
    try {
      typeof value === 'string' ? JSON.parse(value) : value
      callback()
    } catch (e) {
      callback(new Error(i18n.t('common.InvalidJson')))
    }
  }
}

export const JsonRequiredUserNameMapped = {
  required: true,
  trigger: 'change',
  validator: (rule, value, callback) => {
    try {
      const v = typeof value === 'string' ? JSON.parse(value) : value
      const hasUserName = _.map(v, (value) => value)
      if (!hasUserName.includes('username')) {
        callback(new Error(i18n.t('common.requiredHasUserNameMapped')))
      }
      callback()
    } catch (e) {
      callback(new Error(i18n.t('common.InvalidJson')))
    }
  }
}
