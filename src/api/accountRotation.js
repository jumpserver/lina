import request from '@/utils/request'

const base = '/api/v1/accounts'

export const listCredentialPolicies = (params) =>
  request({ url: `${base}/credential-policies/`, method: 'get', params })

export const getCredentialPolicy = (id) =>
  request({ url: `${base}/credential-policies/${id}/`, method: 'get' })

export const createCredentialPolicy = (data) =>
  request({ url: `${base}/credential-policies/`, method: 'post', data })

export const updateCredentialPolicy = (id, data) =>
  request({ url: `${base}/credential-policies/${id}/`, method: 'patch', data })

export const runCredentialPolicyAction = (id, action) =>
  request({ url: `${base}/credential-policies/${id}/${action}/`, method: 'post' })

export const listCredentialBindings = (params) =>
  request({ url: `${base}/credential-application-bindings/`, method: 'get', params })

export const listCredentialClients = (params) =>
  request({ url: `${base}/credential-client-instances/`, method: 'get', params })

export const listAccounts = (params) => request({ url: `${base}/accounts/`, method: 'get', params })

export const updateIntegrationApplication = (id, data) =>
  request({ url: `${base}/integration-applications/${id}/`, method: 'patch', data })

export const createAgentRegistration = (id, data) =>
  request({
    url: `${base}/integration-applications/${id}/agent-registration/`,
    method: 'post',
    data
  })
