import request from '@/utils/request'

export const credentialUrl = '/api/v1/accounts/application-credentials/'
export const choiceValue = (value) => value?.value ?? value

export const normalizeCredential = (item) => ({
  ...item,
  mode: choiceValue(item.mode),
  status: choiceValue(item.status)
})

export async function requestCredentialTable(url, config) {
  const response = await request.get(url, config)
  response.data.results = response.data.results.map(normalizeCredential)
  return response
}

export async function getApplicationCredential(id) {
  return normalizeCredential(await request.get(`${credentialUrl}${id}/`))
}

export const getCredentialRotationStatus = (id) =>
  request.get(`${credentialUrl}${id}/rotation-status/`)

export const getCredentialAccessApplications = (id) =>
  request.get(`${credentialUrl}${id}/access-applications/`, { disableFlashErrorMsg: true })

export const generateApplicationAccessMaterials = (id, data) =>
  request.post(`/api/v1/accounts/integration-applications/${id}/access-materials/`, data)

export const getCredentialRotationEvents = (id, params = {}) =>
  request.get(`${credentialUrl}${id}/rotation-events/`, { params, disableFlashErrorMsg: true })

export const getCredentialEventHistory = (id, params = {}) =>
  request.get(`${credentialUrl}${id}/event-history/`, { params, disableFlashErrorMsg: true })

export const getCredentialEventCycles = (id, params = {}) =>
  request.get(`${credentialUrl}${id}/event-cycles/`, { params, disableFlashErrorMsg: true })

export async function startApplicationCredentialCycle(id) {
  const response = await request.post(`${credentialUrl}${id}/start-cycle/`)
  return { ...response, credential: normalizeCredential(response.credential) }
}

export async function saveApplicationCredential(form) {
  const data = {
    name: form.name,
    mode: form.mode,
    account: form.mode === 'alternating_rotation' ? form.account_id : null,
    alternate_account: form.mode === 'alternating_rotation' ? form.alternate_account_id : null,
    ...(form.mode === 'alternating_rotation'
      ? { source_no_traffic_days: Number(form.source_no_traffic_days ?? 7) }
      : {}),
    subscription_accounts: form.mode === 'subscription' ? form.subscription_account_ids : [],
    applications: form.application_ids,
    is_active: form.is_active,
    comment: form.comment
  }
  const item = form.id
    ? await request.patch(`${credentialUrl}${form.id}/`, data)
    : await request.post(credentialUrl, data)
  return normalizeCredential(item)
}

export const deleteApplicationCredential = (id) => request.delete(`${credentialUrl}${id}/`)

export async function advanceApplicationCredentialRotation(credential) {
  const actions = {
    idle: 'start',
    preparing: 'check-preparation',
    waiting_standby: 'check-preparation',
    ready_to_switch: 'start',
    waiting_switch: 'check-usage',
    ready_for_change: 'change-secret',
    changing_secret: 'check-secret-change',
    change_failed: 'check-secret-change',
    recovery_required: 'check-secret-change',
    waiting_revert: 'complete'
  }
  const action = actions[credential.status]
  if (!action) throw new Error(`Unknown credential status: ${credential.status}`)
  return normalizeCredential(await request.post(`${credentialUrl}${credential.id}/${action}/`))
}

export async function cancelApplicationCredentialRotation(id, reason = '') {
  return normalizeCredential(await request.post(`${credentialUrl}${id}/cancel/`, { reason }))
}

export const executeCredentialChange = (automation) =>
  request.post('/api/v1/accounts/change-secret-executions/', { automation })

export const retryCredentialChange = (id, execution_id, reason) =>
  request.post(`${credentialUrl}${id}/retry-change/`, { execution_id, reason })

export const setClientInstanceActive = (id, isActive, reason = '') =>
  request.patch(`/api/v1/accounts/credential-client-instances/${id}/`, {
    is_active: isActive,
    reason
  })

export async function forceStopApplicationCredentialRotation(id, reason) {
  return normalizeCredential(await request.post(`${credentialUrl}${id}/force-stop/`, { reason }))
}
