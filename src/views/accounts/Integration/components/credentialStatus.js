export const rotationStatuses = {
  idle: 'RotationNormal',
  waiting_backup: 'WaitingForBackupAccount',
  ready_for_change: 'ReadyForSecretChange',
  changing_secret: 'ChangingSecret',
  waiting_primary: 'WaitingForPrimaryAccount'
}

export function credentialStatusLabel(credential, t) {
  const enabled = t(credential.is_active ? 'Enabled' : 'Disabled')
  if (credential.type === 'fixed' || credential.status === 'idle') return enabled
  const status = rotationStatuses[credential.status]
    ? t(rotationStatuses[credential.status])
    : credential.status || '-'
  return credential.is_active ? status : `${enabled} · ${status}`
}
