import request from '@/utils/request'

export const credentialUrl = '/api/v1/accounts/application-credentials/'
export const accessConfigurationUrl = '/api/v1/accounts/client-access-configurations/'
export const rotationRecordUrl = '/api/v1/accounts/credential-rotation-records/'
export const choiceValue = (value) => value?.value ?? value

export const normalizeCredential = (item) => ({
  ...item,
  type: choiceValue(item.type),
  rotation_mode: choiceValue(item.rotation_mode),
  status: choiceValue(item.status)
})

export const normalizeAccessConfiguration = (item) => ({
  ...item,
  type: choiceValue(item.type),
  language: choiceValue(item.language),
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

export async function saveApplicationCredential(form) {
  const dual = form.type === 'rotation' && form.rotation_mode === 'dual'
  const data = {
    name: form.name,
    type: form.type,
    rotation_mode: form.type === 'rotation' ? form.rotation_mode : '',
    primary_account: dual ? form.primary_account_id : form.account_id,
    backup_account: dual ? form.backup_account_id : null,
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
    waiting_backup: 'check-usage',
    ready_for_change: 'change-secret',
    changing_secret: 'check-secret-change',
    waiting_primary: 'complete'
  }
  const action = actions[credential.status]
  if (!action) throw new Error(`Unknown credential status: ${credential.status}`)
  return normalizeCredential(await request.post(`${credentialUrl}${credential.id}/${action}/`))
}

export async function cancelApplicationCredentialRotation(id) {
  return normalizeCredential(await request.post(`${credentialUrl}${id}/cancel/`))
}

export async function saveClientAccessConfiguration(application, form) {
  const data = {
    application: application.id,
    name: form.name,
    type: form.type,
    credentials: form.credential_ids,
    language: 'python',
    app_user: form.app_user,
    install_path: form.install_path,
    is_active: form.is_active
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
export const setClientInstanceActive = (id, isActive) =>
  request.patch(`/api/v1/accounts/credential-client-instances/${id}/`, { is_active: isActive })
