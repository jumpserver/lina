import cloneDeep from 'lodash/cloneDeep'
import { encryptPassword } from '@/utils/session-encrypt'

export function normalizeEmailSettings(value) {
  const data = { ...value }
  if (data.EMAIL_SECURITY_PROTOCOL !== undefined) {
    data.EMAIL_USE_SSL = data.EMAIL_SECURITY_PROTOCOL === 'ssl'
    data.EMAIL_USE_TLS = data.EMAIL_SECURITY_PROTOCOL === 'tls'
    delete data.EMAIL_SECURITY_PROTOCOL
  }
  return data
}

export function prepareTestSettings(value, encryptedFields = [], normalize = data => data) {
  const data = normalize(cloneDeep(value))
  for (const field of encryptedFields) {
    if (data[field] === '' || data[field] === null || data[field] === undefined) {
      delete data[field]
    } else {
      data[field] = encryptPassword(data[field])
    }
  }
  return data
}

function errorMessage(data) {
  if (Array.isArray(data)) return data.map(errorMessage).join('; ')
  if (data && typeof data === 'object') {
    const detail = data.error || data.msg || data.detail
    if (detail) return errorMessage(detail)
    return Object.entries(data).map(([key, value]) => `${key}: ${errorMessage(value)}`).join('; ')
  }
  return data ? String(data) : ''
}

export function settingsTestErrorMessage(error, fallback) {
  return errorMessage(error.response?.data) || error.message || fallback
}

export async function runSettingsTest(vm, {
  value, form, button, request, encryptedFields = [], normalize, onError
}) {
  if (button.loading) return
  button.loading = true
  try {
    const snapshot = cloneDeep(value)
    const valid = await new Promise(resolve => form.validate(resolve))
    if (!valid) return
    const data = prepareTestSettings(snapshot, encryptedFields, normalize)
    const result = await request(data)
    vm.$message.success(result.msg || vm.$t('TestSuccessMsg'))
    return result
  } catch (error) {
    if (onError && error.response?.data) onError(error)
    vm.$message.error(settingsTestErrorMessage(error, vm.$t('TestFailed')))
  } finally {
    button.loading = false
  }
}
