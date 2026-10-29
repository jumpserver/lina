export const eventLabels = {
  'rotation.verify.started': 'RotationVerificationStartedEvent',
  'rotation.verify.skipped': 'RotationVerificationSkippedEvent',
  'rotation.verify.failed': 'RotationVerificationFailedEvent',
  'rotation.verify.cancelled': 'RotationVerificationCancelledEvent',
  'rotation.preparation.started': 'RotationPreparationStartedEvent',
  'rotation.accounts.aligned': 'RotationAccountsAlignedEvent',
  'rotation.standby.waiting': 'RotationStandbyWaitingEvent',
  'rotation.preparation.ready': 'RotationPreparationReadyEvent',
  'rotation.preparation.cancelled': 'RotationPreparationCancelledEvent',
  'credential.updated': 'AppAuditCredentialPublished',
  'credential.revoked': 'AppAuditAuthorizationRevoked',
  'app.scope.updated': 'AppAuditApplicationScopeUpdated',
  'rotation.started': 'AppAuditRotationStarted',
  'rotation.waiting_for_app': 'RotationEventWaitingForSwitch',
  'rotation.source.waiting': 'RotationSourceWaitingEvent',
  'rotation.source.ready': 'RotationSourceReadyEvent',
  'rotation.force_stopped': 'ForceStopRotation',
  'rotation.completed': 'AppAuditRotationCompleted',
  'rotation.failed': 'RotationEventFailed',
  'credential.change.started': 'AppAuditSecretChangeStarted',
  'credential.change.completed': 'AppAuditSecretChangeCompleted',
  'credential.change.failed': 'AppAuditSecretChangeFailed'
}

export function canonicalEventName(value) {
  const aliases = {
    'rotation.verification.skipped': 'rotation.verify.skipped',
    'rotation.verification.started': 'rotation.verify.started',
    'rotation.verification.failed': 'rotation.verify.failed',
    'rotation.verification.cancelled': 'rotation.verify.cancelled',
    'application.scope.updated': 'app.scope.updated',
    'application.restart.requested': 'app.restart.requested',
    'rotation.waiting_for_application': 'rotation.waiting_for_app',
    'configuration.updated': 'app.scope.updated'
  }
  return Object.hasOwn(aliases, value) ? aliases[value] : value
}

eventLabels['rotation.verification.started'] = eventLabels['rotation.verify.started']
eventLabels['rotation.verification.failed'] = eventLabels['rotation.verify.failed']
eventLabels['rotation.verification.cancelled'] = eventLabels['rotation.verify.cancelled']
eventLabels['application.scope.updated'] = eventLabels['app.scope.updated']
eventLabels['rotation.waiting_for_application'] = eventLabels['rotation.waiting_for_app']
eventLabels['configuration.updated'] = eventLabels['app.scope.updated']

eventLabels['rotation.verification.skipped'] = eventLabels['rotation.verify.skipped']

export const statusLabels = {
  received: 'RotationEventReceived',
  unacknowledged: 'RotationEventUnacknowledged',
  failed: 'RotationEventPublishFailed',
  publishing: 'RotationEventPublishing',
  not_targeted: 'RotationEventNotTargeted'
}

export function receiptStatus(receipt) {
  if (!receipt) return 'not_targeted'
  if (receipt.received_at) return 'received'
  if (receipt.publish_result === 'failed') return 'failed'
  return receipt.publish_result === 'pending' ? 'publishing' : 'unacknowledged'
}

export function groupClientEvents(events) {
  const groups = new Map()
  for (const event of events) {
    const date = new Date(event.published_at).toLocaleDateString('sv-SE')
    const key = event.rotation_id || date
    if (!groups.has(key)) groups.set(key, { key, date, rotationId: event.rotation_id, events: [] })
    groups.get(key).events.push(event)
  }
  return [...groups.values()]
}

export function buildEventLanes(data) {
  const events = [...(data?.events || [])].sort((a, b) => a.sequence - b.sequence)
  const lanes = (data?.instances || []).map((client) => {
    const receipts = new Map(client.receipts.map((receipt) => [receipt.event_id, receipt]))
    const nodes = events.map((event) => {
      const receipt = receipts.get(event.id)
      const status = receiptStatus(receipt)
      return { event, receipt, status }
    })
    const receivedCount = nodes.filter((node) => node.status === 'received').length
    const targetCount = nodes.filter((node) => node.receipt).length
    const receiptState = !targetCount
      ? 'not_targeted'
      : nodes.some((node) => node.status === 'failed')
        ? 'failed'
        : receivedCount < targetCount
          ? 'pending'
          : 'received'
    return {
      ...client,
      nodes,
      receivedCount,
      targetCount,
      receiptState
    }
  })
  return { events, lanes }
}
