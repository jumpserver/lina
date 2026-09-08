const OPERATION_SUFFIXES = [
  ['partial_update', 'ChatAIOperationUpdate'],
  ['retrieve', 'ChatAIOperationRetrieve'],
  ['destroy', 'ChatAIOperationDelete'],
  ['delete', 'ChatAIOperationDelete'],
  ['create', 'ChatAIOperationCreate'],
  ['update', 'ChatAIOperationUpdate'],
  ['execute', 'ChatAIOperationExecute'],
  ['run', 'ChatAIOperationExecute'],
  ['list', 'ChatAIOperationList']
]

const OPERATION_RESOURCES = {
  assets_assets: 'ChatAIOperationResourceAssets',
  assets_categories: 'ChatAIOperationResourceAssetCategories',
  assets_hosts: 'ChatAIOperationResourceHosts',
  assets_nodes_assets: 'ChatAIOperationResourceNodeAssets',
  assets_nodes: 'ChatAIOperationResourceNodes',
  assets_platforms: 'ChatAIOperationResourcePlatforms',
  assets_protocols: 'ChatAIOperationResourceProtocols',
  audits_activities: 'ChatAIOperationResourceActivities',
  audits_job_logs: 'ChatAIOperationResourceJobLogs',
  audits_jobs: 'ChatAIOperationResourceJobs',
  audits_login_logs: 'ChatAIOperationResourceLoginLogs',
  audits_my_login_logs: 'ChatAIOperationResourceLoginLogs',
  audits_operate_logs: 'ChatAIOperationResourceOperationLogs',
  audits_service_access_logs: 'ChatAIOperationResourceServiceAccessLogs',
  audits_tickets: 'ChatAIOperationResourceTickets',
  ops_jobs: 'ChatAIOperationResourceJobs',
  ops_tasks: 'ChatAIOperationResourceTasks',
  terminal_commands: 'ChatAIOperationResourceCommands',
  terminal_components_metrics: 'ChatAIOperationResourceMetrics',
  terminal_sessions: 'ChatAIOperationResourceSessions',
  terminal_tasks: 'ChatAIOperationResourceTasks',
  terminal_terminals: 'ChatAIOperationResourceComponents'
}

const FIELD_KEYS = {
  address: 'ChatAIFieldAddress',
  date_created: 'ChatAIFieldDateCreated',
  date_updated: 'ChatAIFieldDateUpdated',
  gateway_enabled: 'ChatAIFieldGatewayEnabled',
  has_package: 'ChatAIFieldHasPackage',
  id: 'ID',
  is_active: 'ChatAIFieldActive',
  name: 'ChatAIFieldName',
  org_name: 'ChatAIFieldOrganization',
  platform: 'ChatAIFieldPlatform',
  status: 'ChatAIFieldStatus',
  updated_by: 'ChatAIFieldUpdatedBy',
  username: 'ChatAIFieldUsername'
}

function identifierKey(value) {
  return String(value || '')
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('')
}

function globalFieldKey(value, te) {
  const candidate = identifierKey(value)
  if (candidate && te(candidate)) return candidate
  return ''
}

function operationResourceKey(value, te) {
  if (OPERATION_RESOURCES[value]) return OPERATION_RESOURCES[value]

  const parts = value.split('_').slice(1)
  const candidates = [identifierKey(parts.join('_'))]
  if (parts.length) {
    const singular = [...parts]
    singular[singular.length - 1] = singular.at(-1).replace(/s$/, '')
    candidates.push(identifierKey(singular.join('_')))
  }
  return candidates.find((candidate) => candidate && te(candidate)) || ''
}

export function isTechnicalIdentifier(value) {
  return /^[a-z0-9]+(?:_[a-z0-9]+)+$/i.test(String(value || '').trim())
}

export function operationLabel(value, t, te) {
  const operation = String(value || '')
    .trim()
    .split('.')
    .at(-1)
  if (!isTechnicalIdentifier(operation)) return ''

  const suffix = OPERATION_SUFFIXES.find(([name]) => operation.endsWith(`_${name}`))
  if (!suffix) return ''

  const resourceName = operation.slice(0, -(suffix[0].length + 1))
  const resourceKey = operationResourceKey(resourceName, te)
  const resource = resourceKey ? t(resourceKey) : t('ChatAIOperationResourcePlatform')
  return t(suffix[1], { resource })
}

export function localizedFieldLabel(value, t, te) {
  const field = String(value || '')
  const fieldKey = FIELD_KEYS[field] || globalFieldKey(field, te)
  if (fieldKey) return fieldKey === 'ID' ? fieldKey : t(fieldKey)
  return field
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}
