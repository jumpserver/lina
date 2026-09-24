export const rotationStatuses = {
  idle: 'RotationNormal',
  waiting_switch: 'WaitingForAccountSwitch',
  ready_for_change: 'ReadyForSecretChange',
  changing_secret: 'ChangingSecret',
  change_failed: 'PamChangeFailed',
  recovery_required: 'PamRecoveryRequired',
  waiting_revert: 'WaitingForAccountRevert'
}

export function credentialStatusLabel(credential, t) {
  const enabled = t(credential.is_active ? 'Enabled' : 'Disabled')
  if (credential.mode === 'subscription' || credential.status === 'idle') return enabled
  const status = rotationStatuses[credential.status]
    ? t(rotationStatuses[credential.status])
    : credential.status || '-'
  return credential.is_active ? status : `${enabled} · ${status}`
}
