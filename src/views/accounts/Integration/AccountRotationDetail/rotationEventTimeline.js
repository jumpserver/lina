export const eventLabels = {
  'credential.updated': 'AppAuditCredentialPublished',
  'credential.revoked': 'AppAuditAuthorizationRevoked',
  'configuration.updated': 'AppAuditConfigurationUpdated',
  'rotation.started': 'AppAuditRotationStarted',
  'rotation.waiting_for_application': 'RotationEventWaitingForSwitch',
  'rotation.completed': 'AppAuditRotationCompleted',
  'rotation.failed': 'RotationEventFailed',
  'credential.change.started': 'AppAuditSecretChangeStarted',
  'credential.change.completed': 'AppAuditSecretChangeCompleted',
  'credential.change.failed': 'AppAuditSecretChangeFailed'
}

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
    return {
      ...client,
      nodes,
      receivedCount: nodes.filter((node) => node.status === 'received').length,
      targetCount: nodes.filter((node) => node.receipt).length
    }
  })
  return { events, lanes }
}
