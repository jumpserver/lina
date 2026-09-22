import { rotationStatuses } from './credentialStatus.js'

export const auditEvents = {
  configuration_created: 'AppAuditConfigurationCreated',
  configuration_updated: 'AppAuditConfigurationUpdated',
  configuration_deleted: 'AppAuditConfigurationDeleted',
  authorization_granted: 'AppAuditAuthorizationUpdated',
  authorization_revoked: 'AppAuditAuthorizationRevoked',
  credential_fetched: 'AppAuditCredentialFetched',
  credential_published: 'AppAuditCredentialPublished',
  credential_confirmed: 'AppAuditCredentialApplied',
  credential_stream_connected: 'AppAuditCredentialStreamConnected',
  credential_stream_disconnected: 'AppAuditCredentialStreamDisconnected',
  rotation_step: 'AppAuditRotationStep',
  rotation_started: 'AppAuditRotationStarted',
  rotation_cancelled: 'CancelRotation',
  secret_change_finished: 'AppAuditSecretChangeFinished',
  secret_change_started: 'AppAuditSecretChangeStarted',
  secret_change_completed: 'AppAuditSecretChangeCompleted',
  secret_change_failed: 'AppAuditSecretChangeFailed',
  client_registered: 'AppAuditClientRegistered',
  client_enabled: 'Enable',
  client_disabled: 'AppAuditClientDisabled',
  notification: 'AppAuditNotificationDelivered',
  application_secret_reset: 'ApplicationSecretReset'
}
export const auditResults = {
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
  return {
    ...row,
    event_display: auditEvents[row.event] ? t(auditEvents[row.event]) : row.event,
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
