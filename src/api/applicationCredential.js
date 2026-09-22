import request from '@/utils/request'

export const credentialUrl = '/api/v1/accounts/application-credentials/'
export const accessConfigurationUrl = '/api/v1/accounts/client-access-configurations/'
export const choiceValue = (value) => value?.value ?? value

export const normalizeCredential = (item) => ({
  ...item,
  mode: choiceValue(item.mode),
  status: choiceValue(item.status)
})

export const normalizeAccessConfiguration = (item) => ({
  ...item,
  type: choiceValue(item.type),
  language: choiceValue(item.language),
  delivery_mode: choiceValue(item.delivery_mode),
  systemd_action: choiceValue(item.systemd_action),
  credential_ids: item.credentials.map((credential) => credential.id),
  application_name: item.application.name,
  instances: item.instances_amount || 0,
  status: !item.is_active ? 'disabled' : item.online_instances_amount > 0 ? 'online' : 'offline'
})

export async function requestCredentialTable(url, config) {
  const response = await request.get(url, config)
  response.data.results = response.data.results.map(normalizeCredential)
  return response
}

export async function requestAccessConfigurationTable(url, config) {
  const response = await request.get(url, config)
  response.data.results = response.data.results.map(normalizeAccessConfiguration)
  return response
}

export async function getApplicationCredential(id) {
  return normalizeCredential(await request.get(`${credentialUrl}${id}/`))
}

export const getCredentialRotationStatus = (id) =>
  request.get(`${credentialUrl}${id}/rotation-status/`)

export async function saveApplicationCredential(form) {
  const data = {
    name: form.name,
    mode: form.mode,
    account: form.mode === 'alternating_rotation' ? form.account_id : null,
    alternate_account: form.mode === 'alternating_rotation' ? form.alternate_account_id : null,
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

export async function saveClientAccessConfiguration(application, form) {
  const data = {
    application: application.id,
    name: form.name,
    type: form.type,
    credentials: form.credential_ids,
    language: 'python',
    app_user: form.app_user,
    install_path: form.install_path,
    delivery_mode: form.delivery_mode,
    systemd_unit: form.delivery_mode === 'environment' ? form.systemd_unit : '',
    systemd_action: form.systemd_action,
    is_active: form.is_active,
    removal_reason: form.removal_reason || ''
  }
  const item = form.id
    ? await request.patch(`${accessConfigurationUrl}${form.id}/`, data)
    : await request.post(accessConfigurationUrl, data)
  return normalizeAccessConfiguration(item)
}

export const deleteClientAccessConfiguration = (id) =>
  request.delete(`${accessConfigurationUrl}${id}/`)
export const getClientAccessConfiguration = async (id) =>
  normalizeAccessConfiguration(await request.get(`${accessConfigurationUrl}${id}/`))
export const generateClientAccessMaterials = (id) =>
  request.post(`${accessConfigurationUrl}${id}/materials/`)
export const setClientInstanceActive = (id, isActive, reason = '') =>
  request.patch(`/api/v1/accounts/credential-client-instances/${id}/`, {
    is_active: isActive,
    reason
  })
