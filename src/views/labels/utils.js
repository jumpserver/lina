import { joinErrorMessages } from '@/utils/common'

function normalizeErrorMessage(error) {
  if (Array.isArray(error) && error.every((item) => typeof item === 'string')) {
    return joinErrorMessages(error)
  }

  if (Array.isArray(error) && error.every((item) => _.isPlainObject(item))) {
    const nestedMessages = []
    error.forEach((item) => {
      Object.values(item).forEach((value) => {
        if (Array.isArray(value)) {
          nestedMessages.push(...value)
        }
      })
    })
    return joinErrorMessages(nestedMessages, ' ')
  }

  if (_.isPlainObject(error)) {
    return JSON.stringify(error)
  }

  return String(error || '')
}

function isDuplicateLikeMessage(message) {
  return /unique|duplicate|already exists|must be unique|must make a unique set|已存在|重复|唯一/i.test(
    message
  )
}

export function normalizeLabelFormErrors(errors = {}) {
  if (!_.isPlainObject(errors)) {
    return errors
  }

  if (!errors.name || !errors.value) {
    return errors
  }

  const normalizedNameMessage = normalizeErrorMessage(errors.name)
  const normalizedValueMessage = normalizeErrorMessage(errors.value)

  const shouldPreferValueField =
    normalizedNameMessage === normalizedValueMessage ||
    (isDuplicateLikeMessage(normalizedNameMessage) &&
      isDuplicateLikeMessage(normalizedValueMessage))

  if (!shouldPreferValueField) {
    return errors
  }

  return {
    ...errors,
    name: '',
    value: normalizedValueMessage || normalizedNameMessage
  }
}
