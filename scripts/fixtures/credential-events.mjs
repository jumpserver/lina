// Synthetic UI fixtures only: no credentials, registrations, database writes or network calls.
export function createCredentialEventFixture(mode = 'rotation', count = 300) {
  const codes =
    mode === 'rotation'
      ? [
          'credential.updated',
          'rotation.started',
          'rotation.waiting_for_application',
          'credential.change.started',
          'credential.change.completed',
          'rotation.completed'
        ]
      : [
          'credential.change.started',
          'credential.change.completed',
          'credential.updated',
          'configuration.updated',
          'credential.change.started',
          'credential.change.failed',
          'credential.change.started',
          'credential.change.completed',
          'credential.updated',
          'credential.revoked'
        ]
  const events = Array.from({ length: 180 }, (_, index) => ({
    id: `${mode}-event-${index}`,
    sequence: index + 1,
    event: codes[index % codes.length],
    rotation_id:
      mode === 'rotation'
        ? `demo-rotation-${String(Math.floor(index / 6) + 1).padStart(8, '0')}`
        : null,
    published_at: new Date(
      Date.UTC(2026, 7, 25) +
        Math.floor(index / codes.length) * 86400000 +
        (index % codes.length) * 45000
    ).toISOString(),
    revision: Math.floor(index / codes.length) + 1
  }))
  const clients = Array.from({ length: count }, (_, index) => {
    const number = String(index + 1).padStart(3, '0')
    const type = index % 2 ? 'agent' : 'sdk'
    const online = index % 10 < 7
    const isActive = index % 10 !== 9
    const history = events
      .filter((_, i) => index % 43 !== 42 && (index % 17 !== 16 || i >= 100))
      .map((event, i) => {
        const missed = (!online && i > 12) || (index % 7 === 6 && i % 4 === 0) || index % 19 === 18
        return {
          ...event,
          received_at: missed
            ? null
            : new Date(Date.parse(event.published_at) + ((index % 8) + 1) * 1000).toISOString(),
          publish_result: missed && index % 7 === 6 ? 'failed' : 'published'
        }
      })
      .reverse()
    return {
      id: `${mode}-client-${number}`,
      instance_id: `${['order', 'payment', 'inventory', 'notification'][index % 4]}-${type}-node-${number}`,
      type,
      online,
      is_active: isActive,
      supports_receipts: index % 19 !== 18,
      application: {
        id: `app-${index % 8}`,
        name: `${['订单', '支付', '库存', '通知'][index % 4]}服务-${(index % 8) + 1}`
      },
      configuration: {
        id: `config-${index % 12}`,
        name: `${type === 'sdk' ? 'Python SDK' : 'Linux Agent'} / ${index % 3 === 0 ? '华东' : '华北'}`
      },
      latest_event: history[0] || null,
      latest_received_event: history.find((event) => event.received_at) || null,
      history
    }
  })
  return { mode, events, clients }
}

export function fixtureHistory(fixture, params = {}) {
  const limit = params.limit || 20
  const offset = params.offset || 0
  if (params.client_id) {
    const { history, ...client } = fixture.clients.find((item) => item.id === params.client_id)
    return {
      client,
      count: history.length,
      latest_event: client.latest_event,
      latest_received_event: client.latest_received_event,
      results: history.slice(offset, offset + limit)
    }
  }
  const search = (params.client_search || '').toLowerCase().trim()
  const clients = fixture.clients.filter(
    (client) =>
      (!search ||
        [client.instance_id, client.application.name, client.configuration.name].some((value) =>
          value.toLowerCase().includes(search)
        )) &&
      (!params.client_type || params.client_type === client.type) &&
      (!params.state ||
        (params.state === 'online'
          ? client.online
          : params.state === 'offline'
            ? !client.online && client.is_active
            : !client.is_active))
  )
  return {
    count: clients.length,
    results: clients.slice(offset, offset + limit).map(({ history, ...client }) => client)
  }
}

export function fixtureRotation(fixture, rotationId) {
  const events = fixture.events.filter((event) => event.rotation_id === rotationId)
  const ids = new Set(events.map((event) => event.id))
  return {
    rotation_id: rotationId,
    status: 'success',
    events,
    instances: fixture.clients.map(({ history, ...client }) => ({
      ...client,
      receipts: history
        .filter((event) => ids.has(event.id))
        .reverse()
        .map((event) => ({
          event_id: event.id,
          received_at: event.received_at,
          publish_result: event.publish_result
        }))
    }))
  }
}
