export const eventLabels = {
  'rotation.verify.started': 'RotationVerificationStartedEvent',
  'rotation.verify.skipped': 'RotationVerificationSkippedEvent',
  'rotation.verify.failed': 'RotationVerificationFailedEvent',
  'rotation.verify.cancelled': 'RotationVerificationCancelledEvent',
  'credential.secret.updated': 'CredentialSecretUpdatedEvent',
  'credential.switch.published': 'RotationSwitchPublished',
  'credential.refresh.requested': 'CredentialRefreshRequestedEvent',
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

const accountName = (account) => {
  const name = account?.name || account?.username || account?.id || '—'
  return account?.username && account.username !== name ? `${name} (${account.username})` : name
}

export function rotationEventTitle(event) {
  const code = event.event
  const accounts = event.rotation_accounts
  const action = eventLabels[code] || code
  if (!accounts) return { action }
  if (code === 'credential.switch.published' && event.account_switch) {
    return {
      action: event.account_switch.reverting
        ? 'RotationRevertPublished'
        : 'RotationSwitchPublished',
      template: 'RotationEventWithDirection',
      params: {
        source: accountName(event.account_switch.from_account),
        target: accountName(event.account_switch.to_account)
      }
    }
  }
  if (code === 'rotation.started' || code === 'rotation.completed') {
    return {
      action,
      template: 'RotationEventWithDirection',
      params: { source: accountName(accounts.source), target: accountName(accounts.target) }
    }
  }
  const account = code.startsWith('rotation.verify.')
    ? accounts.target
    : code.startsWith('credential.change.')
      ? (typeof event.account === 'object' && event.account) ||
        Object.values(accounts).find((account) => account?.id === event.account_id) ||
        accounts.change
      : code.startsWith('rotation.source.')
        ? accounts.source
        : [
              'rotation.waiting_for_app',
              'credential.secret.updated',
              'credential.refresh.requested'
            ].includes(code)
          ? event.published_account
          : null
  return account
    ? { action, template: 'RotationEventWithAccount', params: { account: accountName(account) } }
    : { action }
}

export function buildCycleEventTimeline(cycle, stages = []) {
  const byEvent = new Map(
    stages.filter((stage) => stage.event).map((stage) => [stage.event.id, stage])
  )
  const nodes = (cycle?.events || []).map((event) => {
    const stage = byEvent.get(event.id)
    const reviewRequired =
      !!event.review_required_count || stage?.statusLabel === 'ApplicationFailureReviewRequired'
    const failed = event.event.endsWith('.failed') || reviewRequired
    const waiting = !failed && !stage?.completed && stage?.icon === 'Clock'
    return {
      event,
      type: failed ? 'danger' : waiting && !stage.current ? 'info' : 'primary',
      hollow: waiting,
      statusLabel: reviewRequired
        ? 'ApplicationFailureReviewRequired'
        : failed
          ? 'Failed'
          : stage?.statusLabel || 'PolicyStageEmitted'
    }
  })
  let traversed = true
  return nodes.map((node, index) => {
    traversed = traversed && !node.hollow
    return {
      ...node,
      trail:
        traversed && index < nodes.length - 1
          ? node.type === 'danger' || nodes[index + 1].type === 'danger'
            ? 'danger'
            : 'primary'
          : 'pending'
    }
  })
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
