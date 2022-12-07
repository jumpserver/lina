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

export const specialEmojiCheck = {
  validator: (rule, value, callback) => {
    value = value.trim()
    if (/[\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/.test(value)) {
      callback(new Error(i18n.t('common.NotSpecialEmoji')))
    } else {
      callback()
    }
  },
  trigger: ['blur', 'change']
}

export default {
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
      JSON.parse(value)
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
      JSON.parse(value)
      const hasUserName = _.map(JSON.parse(value), (value) => value)
      if (!hasUserName.includes('username')) {
        callback(new Error(i18n.t('common.requiredHasUserNameMapped')))
      }
      callback()
    } catch (e) {
      callback(new Error(i18n.t('common.InvalidJson')))
    }
  }
}
