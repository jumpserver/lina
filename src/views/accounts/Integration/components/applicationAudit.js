export const auditEvents = {
  configuration_created: 'AppAuditConfigurationCreated',
  configuration_updated: 'AppAuditConfigurationUpdated',
  configuration_deleted: 'AppAuditConfigurationDeleted',
  authorization_granted: 'AppAuditAuthorizationUpdated',
  authorization_revoked: 'AppAuditAuthorizationRevoked',
  credential_fetched: 'AppAuditCredentialFetched',
  credential_published: 'AppAuditCredentialPublished',
  credential_confirmed: 'AppAuditCredentialApplied',
  rotation_step: 'AppAuditRotationStep',
  rotation_started: 'AppAuditRotationStarted',
  rotation_cancelled: 'CancelRotation',
  secret_change_finished: 'AppAuditSecretChangeFinished',
  client_registered: 'AppAuditClientRegistered',
  client_enabled: 'Enable',
  client_disabled: 'AppAuditClientDisabled',
  subscription_snapshot: 'AppAuditSubscriptionSnapshot',
  notification: 'AppAuditNotificationDelivered'
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
  primary_account_id: 'PrimaryAccount',
  backup_account_id: 'BackupAccount',
  status: 'Status',
  revision: 'AppAuditRevision',
  is_active: 'IsActive',
  accounts: 'Accounts',
  ip_group: 'IPGroup',
  notification_enabled: 'AppNotificationEnabled',
  notification_url: 'AppNotificationURL',
  app_user: 'ApplicationRunUser',
  install_path: 'InstallPath'
}
const summaries = {
  'Waiting for client delivery.': 'AppAuditPendingDelivery',
  'Notification delivered; application confirmation is separate.': 'AppAuditDeliverySummary',
  'Notification failed; waiting for retry.': 'AppAuditRetrySummary',
  'Notification retry limit reached.': 'AppAuditDeliveryFailedSummary',
  'Notification retry limit or deadline reached.': 'AppAuditDeliveryFailedSummary',
  'Notification delivery deadline reached.': 'AppAuditDeadline',
  'Event listener stopped.': 'AppAuditListenerStopped',
  'Credential access was revoked.': 'AppAuditAuthorizationRevoked',
  'Client delivery lease expired.': 'AppAuditLeaseExpired',
  'Delivery deadline reached.': 'AppAuditDeadline',
  callback_failed: 'AppAuditCallbackFailed',
  http_failed: 'AppAuditHTTPFailed',
  credential_not_ready: 'AppAuditCredentialNotReady',
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

export function normalizeAudit(row, t) {
  return {
    ...row,
    event_display: auditEvents[row.event] ? t(auditEvents[row.event]) : row.event,
    result_display: auditResults[row.result] ? t(auditResults[row.result]) : row.result,
    summary: summaries[row.summary] ? t(summaries[row.summary]) : row.summary,
    changes: (row.changes || []).map((change) => ({
      ...change,
      field: fieldLabels[change.field] ? t(fieldLabels[change.field]) : change.field,
      before:
        typeof change.before === 'object'
          ? JSON.stringify(change.before)
          : String(change.before ?? '-'),
      after:
        typeof change.after === 'object'
          ? JSON.stringify(change.after)
          : String(change.after ?? '-')
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
