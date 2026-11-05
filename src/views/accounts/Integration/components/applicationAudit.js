import { rotationStatuses } from './credentialStatus.js'

import auditEventDefinitions from './auditEventDefinitions.json' with { type: 'json' }

export { auditEventDefinitions }
export const auditEvents = Object.fromEntries(
  Object.entries(auditEventDefinitions).map(([event, definition]) => [event, definition.label])
)
// Retired event names remain readable in stored audit records, but are not
// offered in the event type filter built from auditEvents.
const historicalAuditEvents = {
  secret_change_finished: 'AppAuditSecretChangeFinished'
}
export const auditResults = {
  running: 'Running',
  success: 'Success',
  failed: 'Failed',
  retrying: 'AppAuditRetrying',
  pending: 'Pending'
}
export const resultTagTypes = {
  success: 'success',
  failed: 'danger',
  retrying: 'warning',
  pending: 'info'
}

const fieldLabels = {
  name: 'Name',
  type: 'Type',
  mode: 'CredentialPolicyMode',
  account_id: 'Account',
  alternate_account_id: 'AlternateAccount',
  active_account_id: 'CurrentAccount',
  status: 'Status',
  revision: 'AppAuditRevision',
  is_active: 'IsActive',
  accounts: 'Accounts',
  ip_group: 'IPGroup',
  app_user: 'ApplicationRunUser',
  install_path: 'InstallPath',
  delivery_mode: 'AgentDeliveryMode',
  systemd_unit: 'SystemdUnit',
  systemd_action: 'SystemdAction'
}
const summaries = {
  'credential.switch.requested': 'ApplicationAccountSwitchRequest',
  'app.restart.requested': 'ApplicationRestartRequest',
  execution_failed: 'ApplicationCommandExecutionFailed',
  superseded: 'ApplicationCommandSuperseded',
  'Notification failed; waiting for retry.': 'AppAuditRetrySummary',
  'Notification delivery deadline reached.': 'AppAuditDeadline',
  'Credential access was revoked.': 'AppAuditAuthorizationRevoked',
  'Delivery deadline reached.': 'AppAuditDeadline',
  credential_not_found: 'AppAuditCredentialNotFound',
  credential_not_selected: 'AppAuditCredentialNotSelected',
  credential_not_authorized: 'AppAuditCredentialNotAuthorized',
  credential_changing: 'AppAuditCredentialChanging',
  configuration_disabled: 'AppAuditConfigurationDisabled',
  client_disabled: 'AppAuditClientDisabled',
  permission_denied: 'AppAuditDeniedSummary',
  invalid: 'AppAuditInvalidRequest',
  required: 'AppAuditInvalidRequest'
}

function formatChangeValue(field, value, t) {
  if (field === 'status' && rotationStatuses[value]) return t(rotationStatuses[value])
  return typeof value === 'object' ? JSON.stringify(value) : String(value ?? '-')
}

export function normalizeAudit(row, t) {
  const definition = auditEventDefinitions[row.event]
  const eventLabel = definition?.label || historicalAuditEvents[row.event]
  return {
    ...row,
    event_display: eventLabel ? t(eventLabel) : row.event,
    event_meaning: definition ? t(definition.meaning) : '',
    related_protocol_events: definition?.protocolEvents || [],
    result_display: auditResults[row.result] ? t(auditResults[row.result]) : row.result,
    summary: summaries[row.summary] ? t(summaries[row.summary]) : row.summary,
    changes: (row.changes || []).map((change) => ({
      ...change,
      field: fieldLabels[change.field] ? t(fieldLabels[change.field]) : change.field,
      before: formatChangeValue(change.field, change.before, t),
      after: formatChangeValue(change.field, change.after, t)
    })),
    notification: row.notification && {
      ...row.notification,
      attempts: row.notification.attempts.map((attempt) => ({
        ...attempt,
        result: t(auditResults[attempt.result] || attempt.result),
        reason: summaries[attempt.reason] ? t(summaries[attempt.reason]) : attempt.reason
      }))
    }
  }
}

export function validNotificationUrl(value) {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password && !url.hash
  } catch {
    return false
  }
}
