export const rotationStatuses = {
  idle: 'RotationNormal',
  waiting_switch: 'WaitingForAccountSwitch',
  waiting_source: 'WaitingForSourceNoSecretFetch',
  ready_for_change: 'ReadyForSecretChange',
  changing_secret: 'ChangingSecret',
  change_failed: 'PamChangeFailed',
  recovery_required: 'PamRecoveryRequired',
  waiting_revert: 'WaitingForAccountRevert'
}

export function credentialStatusLabel(credential, t, rotationStatus) {
  const enabled = t(credential.is_active ? 'Enabled' : 'Disabled')
  if (credential.mode === 'subscription' || credential.status === 'idle') return enabled
  const phase =
    credential.status === 'waiting_switch'
      ? (rotationStatus?.credential_status === credential.status &&
          rotationStatus.rotation_phase) ||
        credential.rotation_phase ||
        credential.status
      : credential.status
  const status = rotationStatuses[phase] ? t(rotationStatuses[phase]) : credential.status || '-'
  return credential.is_active ? status : `${enabled} · ${status}`
}
